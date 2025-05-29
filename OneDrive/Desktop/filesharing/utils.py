import socket
import os
import qrcode
from io import BytesIO
import base64

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

def generate_qr_code(url):
    """Generate QR code for the given URL"""
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(url)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 for embedding in HTML
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        print(f"Error generating QR code: {e}")
        return None

def get_file_size(file_path):
    """Get human readable file size"""
    try:
        size = os.path.getsize(file_path)
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    except:
        return "Unknown"

def is_safe_path(basedir, path):
    """Check if the path is safe (within the base directory)"""
    try:
        basedir = os.path.abspath(basedir)
        path = os.path.abspath(os.path.join(basedir, path))
        return path.startswith(basedir)
    except:
        return False

def scan_directory(directory_path):
    """Recursively scan directory and return file structure"""
    items = []
    try:
        for item in os.listdir(directory_path):
            item_path = os.path.join(directory_path, item)
            if os.path.isfile(item_path):
                items.append({
                    'name': item,
                    'type': 'file',
                    'size': get_file_size(item_path),
                    'path': item_path
                })
            elif os.path.isdir(item_path):
                items.append({
                    'name': item,
                    'type': 'directory',
                    'path': item_path
                })
    except PermissionError:
        pass
    except Exception as e:
        print(f"Error scanning directory: {e}")
    
    return sorted(items, key=lambda x: (x['type'] == 'file', x['name'].lower()))
