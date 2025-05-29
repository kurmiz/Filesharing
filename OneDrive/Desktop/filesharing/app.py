from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash, session
import os
import threading
import time
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

@app.route('/')
def index():
    """Main page for folder selection and server status"""
    global shared_folder, server_running, local_ip, port
    
    server_url = f"http://{local_ip}:{port}"
    qr_code = generate_qr_code(server_url) if shared_folder else None
    
    return render_template('index.html', 
                         shared_folder=shared_folder,
                         server_running=server_running,
                         local_ip=local_ip,
                         port=port,
                         server_url=server_url,
                         qr_code=qr_code)

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
    
    # Security check
    if not is_safe_path(shared_folder, filename):
        return "Access denied", 403
    
    file_path = os.path.join(shared_folder, filename)
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        return "File not found", 404
    
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
    """Upload a file to the shared folder"""
    global shared_folder
    
    if not shared_folder:
        return jsonify({'error': 'No folder is being shared'}), 400
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(shared_folder, filename)
        
        # Check if file already exists
        if os.path.exists(file_path):
            return jsonify({'error': 'File already exists'}), 400
        
        try:
            file.save(file_path)
            return jsonify({'message': f'File {filename} uploaded successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'Upload failed: {str(e)}'}), 500

if __name__ == '__main__':
    print(f"Starting File Sharing Server...")
    print(f"Local IP: {local_ip}")
    print(f"Port: {port}")
    print(f"Access URL: http://{local_ip}:{port}")
    
    app.run(host='0.0.0.0', port=port, debug=True)
