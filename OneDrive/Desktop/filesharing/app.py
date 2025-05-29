from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash, session
import os
import threading
import time
import uuid
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from utils import get_local_ip, generate_qr_code, is_safe_path, scan_directory
import requests

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# Global variables
shared_folder = None
server_running = False
local_ip = get_local_ip()
port = 8080

# Connected users tracking
connected_users = {}
user_activities = []
max_activities = 50

# User session management
def get_or_create_user_session():
    """Get or create a unique user session"""
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        session['user_name'] = None
        session['connected_at'] = datetime.now().isoformat()
    return session['user_id']

def update_user_activity(user_id, action, details=None):
    """Update user activity log"""
    global user_activities

    user_name = connected_users.get(user_id, {}).get('name', 'Anonymous User')
    activity = {
        'user_id': user_id,
        'user_name': user_name,
        'action': action,
        'details': details,
        'timestamp': datetime.now().isoformat(),
        'ip': request.remote_addr if request else 'Unknown'
    }

    user_activities.insert(0, activity)
    if len(user_activities) > max_activities:
        user_activities = user_activities[:max_activities]

def cleanup_inactive_users():
    """Remove inactive users (older than 5 minutes)"""
    global connected_users
    cutoff_time = datetime.now() - timedelta(minutes=5)

    inactive_users = []
    for user_id, user_data in connected_users.items():
        last_seen = datetime.fromisoformat(user_data['last_seen'])
        if last_seen < cutoff_time:
            inactive_users.append(user_id)

    for user_id in inactive_users:
        del connected_users[user_id]
        update_user_activity(user_id, 'disconnected')

@app.route('/')
def index():
    """Main page for folder selection and server status"""
    global shared_folder, server_running, local_ip, port

    # Track user session
    user_id = get_or_create_user_session()

    # Update connected users
    connected_users[user_id] = {
        'name': session.get('user_name', 'Anonymous User'),
        'ip': request.remote_addr,
        'last_seen': datetime.now().isoformat(),
        'connected_at': session.get('connected_at'),
        'current_page': 'home'
    }

    # Clean up inactive users
    cleanup_inactive_users()

    server_url = f"http://{local_ip}:{port}"
    qr_code = generate_qr_code(server_url) if shared_folder else None

    return render_template('index.html',
                         shared_folder=shared_folder,
                         server_running=server_running,
                         local_ip=local_ip,
                         port=port,
                         server_url=server_url,
                         qr_code=qr_code,
                         connected_users=list(connected_users.values()),
                         user_activities=user_activities[:10])

@app.route('/set_folder', methods=['POST'])
def set_folder():
    """Set the folder to share"""
    global shared_folder

    folder_path = request.form.get('folder_path')
    if folder_path and os.path.exists(folder_path) and os.path.isdir(folder_path):
        shared_folder = os.path.abspath(folder_path)
        flash(f'Folder set successfully: {shared_folder}', 'success')
    else:
        flash('Invalid folder path', 'error')

    return redirect(url_for('index'))

@app.route('/browse')
@app.route('/browse/<path:subpath>')
def browse(subpath=''):
    """Browse shared folder contents"""
    global shared_folder

    if not shared_folder:
        flash('No folder is currently being shared', 'error')
        return redirect(url_for('index'))

    # Track user session
    user_id = get_or_create_user_session()

    # Update connected users
    connected_users[user_id] = {
        'name': session.get('user_name', 'Anonymous User'),
        'ip': request.remote_addr,
        'last_seen': datetime.now().isoformat(),
        'connected_at': session.get('connected_at'),
        'current_page': f'browsing: /{subpath}' if subpath else 'browsing: root'
    }

    # Log activity
    update_user_activity(user_id, 'browsing', f'Viewing folder: /{subpath}' if subpath else 'Viewing root folder')

    # Construct the full path
    if subpath:
        current_path = os.path.join(shared_folder, subpath)
    else:
        current_path = shared_folder

    # Security check
    if not is_safe_path(shared_folder, subpath):
        flash('Access denied', 'error')
        return redirect(url_for('browse'))

    if not os.path.exists(current_path):
        flash('Path not found', 'error')
        return redirect(url_for('browse'))

    # Get directory contents
    items = scan_directory(current_path)

    # Create breadcrumb navigation
    breadcrumbs = []
    if subpath:
        parts = subpath.split('/')
        current_breadcrumb = ''
        for part in parts:
            current_breadcrumb = os.path.join(current_breadcrumb, part).replace('\\', '/')
            breadcrumbs.append({
                'name': part,
                'path': current_breadcrumb
            })

    return render_template('browse.html',
                         items=items,
                         current_path=subpath,
                         breadcrumbs=breadcrumbs,
                         shared_folder_name=os.path.basename(shared_folder))

@app.route('/download/<path:filename>')
def download_file(filename):
    """Download a file from the shared folder"""
    global shared_folder

    if not shared_folder:
        return "No folder is being shared", 404

    # Track user session
    user_id = get_or_create_user_session()

    # Security check
    if not is_safe_path(shared_folder, filename):
        return "Access denied", 403

    file_path = os.path.join(shared_folder, filename)
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return "File not found", 404

    # Log download activity
    update_user_activity(user_id, 'download', f'Downloaded: {os.path.basename(filename)}')

    directory = os.path.dirname(file_path)
    filename_only = os.path.basename(file_path)

    return send_from_directory(directory, filename_only, as_attachment=True)

@app.route('/connect')
def connect():
    """Page to connect to other users' shared folders"""
    return render_template('connect.html')

@app.route('/connect_to', methods=['POST'])
def connect_to():
    """Connect to another user's shared folder"""
    remote_ip = request.form.get('remote_ip')
    remote_port = request.form.get('remote_port', '8080')

    if not remote_ip:
        flash('Please enter an IP address', 'error')
        return redirect(url_for('connect'))

    try:
        # Test connection to remote server
        remote_url = f"http://{remote_ip}:{remote_port}/browse"
        response = requests.get(remote_url, timeout=5)
        if response.status_code == 200:
            # Store connection info in session
            session['remote_ip'] = remote_ip
            session['remote_port'] = remote_port
            return redirect(f"http://{remote_ip}:{remote_port}/browse")
        else:
            flash('Could not connect to the remote server', 'error')
    except Exception as e:
        flash(f'Connection failed: {str(e)}', 'error')

    return redirect(url_for('connect'))

@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload files to the shared folder"""
    global shared_folder

    if not shared_folder:
        return jsonify({'error': 'No folder is being shared'}), 400

    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400

    files = request.files.getlist('file')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No files selected'}), 400

    results = []
    success_count = 0
    
    for file in files:
        if file.filename == '':
            continue
            
        try:
            filename = secure_filename(file.filename)
            file_path = os.path.join(shared_folder, filename)
            
            # If file exists, add a number to the filename
            base, ext = os.path.splitext(filename)
            counter = 1
            while os.path.exists(file_path):
                filename = f"{base}_{counter}{ext}"
                file_path = os.path.join(shared_folder, filename)
                counter += 1

            file.save(file_path)
            success_count += 1
            results.append({
                'filename': filename,
                'status': 'success',
                'message': 'Uploaded successfully'
            })
            
            # Update activity log
            user_id = get_or_create_user_session()
            update_user_activity(user_id, 'upload', filename)
            
        except Exception as e:
            results.append({
                'filename': file.filename,
                'status': 'error',
                'message': str(e)
            })

    if success_count == 0:
        return jsonify({
            'error': 'No files were uploaded successfully',
            'details': results
        }), 400

    return jsonify({
        'message': f'{success_count} file(s) uploaded successfully',
        'results': results
    }), 200

# New API endpoints for user management and real-time features

@app.route('/api/set_username', methods=['POST'])
def set_username():
    """Set username for current session"""
    data = request.get_json()
    username = data.get('username', '').strip()

    if not username:
        return jsonify({'error': 'Username cannot be empty'}), 400

    if len(username) > 50:
        return jsonify({'error': 'Username too long'}), 400

    user_id = get_or_create_user_session()
    session['user_name'] = username

    # Update connected users
    if user_id in connected_users:
        old_name = connected_users[user_id].get('name', 'Anonymous User')
        connected_users[user_id]['name'] = username
        update_user_activity(user_id, 'username_changed', f'Changed name from "{old_name}" to "{username}"')

    return jsonify({'success': True, 'username': username})

@app.route('/api/connected_users')
def get_connected_users():
    """Get list of currently connected users"""
    cleanup_inactive_users()

    users_list = []
    for user_id, user_data in connected_users.items():
        users_list.append({
            'id': user_id,
            'name': user_data['name'],
            'ip': user_data['ip'],
            'current_page': user_data['current_page'],
            'connected_at': user_data['connected_at'],
            'last_seen': user_data['last_seen']
        })

    return jsonify({
        'users': users_list,
        'total_count': len(users_list)
    })

@app.route('/api/user_activities')
def get_user_activities():
    """Get recent user activities"""
    return jsonify({
        'activities': user_activities[:20],
        'total_count': len(user_activities)
    })

@app.route('/api/server_stats')
def get_server_stats():
    """Get server statistics"""
    cleanup_inactive_users()

    return jsonify({
        'connected_users_count': len(connected_users),
        'total_activities': len(user_activities),
        'shared_folder': shared_folder,
        'server_uptime': time.time(),  # You can calculate actual uptime
        'local_ip': local_ip,
        'port': port
    })

@app.route('/api/heartbeat', methods=['POST'])
def heartbeat():
    """Update user's last seen timestamp"""
    user_id = get_or_create_user_session()

    if user_id in connected_users:
        connected_users[user_id]['last_seen'] = datetime.now().isoformat()

    return jsonify({'success': True})

@app.route('/debug')
def debug_page():
    """Debug page to test interactive elements"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Debug Interactive Elements</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .test-section { background: white; padding: 20px; margin: 20px 0; border-radius: 10px; }
            .sharing-hub { display: flex; justify-content: center; align-items: center; margin: 40px 0; position: relative; min-height: 300px; }
            .sharing-circle { width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); }
            .sharing-content { text-align: center; color: white; z-index: 2; }
            .sharing-icon { font-size: 3rem; margin-bottom: 10px; }
            .connected-users-indicator { position: absolute; top: -10px; right: -10px; background: white; border-radius: 50%; width: 80px; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); border: 3px solid #4ade80; }
            .users-count { font-size: 1.5rem; font-weight: bold; color: #4ade80; }
            .users-label { font-size: 0.7rem; color: #666; text-transform: uppercase; }
            .users-panel { background: white; border-radius: 15px; padding: 25px; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <h1>🧪 Debug Interactive Elements</h1>

        <div class="test-section">
            <h2>Interactive Sharing Hub Test</h2>
            <div class="sharing-hub">
                <div class="sharing-circle" onclick="alert('Circle clicked!')">
                    <div class="sharing-content">
                        <div class="sharing-icon">📡</div>
                        <div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: #4ade80;">Sharing Active</div>
                            <div style="font-size: 0.9rem; opacity: 0.9;">Click to test</div>
                        </div>
                    </div>
                </div>

                <div class="connected-users-indicator">
                    <div class="users-count">5</div>
                    <div class="users-label">Connected</div>
                </div>
            </div>
        </div>

        <div class="test-section">
            <div class="users-panel">
                <h3>👥 Connected Users Panel Test</h3>
                <p>This panel should be visible with proper styling.</p>
            </div>
        </div>

        <div class="test-section">
            <h2>CSS Variables Test</h2>
            <div style="background: var(--card-bg, red); padding: 20px; border-radius: 10px;">
                <p>If this background is red, CSS variables are not working.</p>
                <p>If this background is white/dark, CSS variables are working.</p>
            </div>
        </div>

        <script>
            console.log('Debug page loaded');
            console.log('Sharing hub element:', document.querySelector('.sharing-hub'));
            console.log('Users panel element:', document.querySelector('.users-panel'));
        </script>
    </body>
    </html>
    '''

if __name__ == '__main__':
    print(f"Starting File Sharing Server...")
    print(f"Local IP: {local_ip}")
    print(f"Port: {port}")
    print(f"Access URL: http://{local_ip}:{port}")

    app.run(host='0.0.0.0', port=port, debug=True)
