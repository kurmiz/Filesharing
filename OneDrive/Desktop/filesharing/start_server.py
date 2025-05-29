#!/usr/bin/env python3
"""
Startup script for the LAN File Sharing Web App
This script provides a user-friendly way to start the server with options.
"""

import os
import sys
import argparse
from utils import get_local_ip

def print_banner():
    """Print application banner"""
    print("=" * 60)
    print("🗂️  LAN FILE SHARING WEB APP")
    print("=" * 60)
    print("A simple and secure way to share files on your local network")
    print()

def print_server_info(ip, port):
    """Print server information"""
    print("📡 SERVER INFORMATION")
    print("-" * 30)
    print(f"Local IP Address: {ip}")
    print(f"Port: {port}")
    print(f"Server URL: http://{ip}:{port}")
    print()
    print("🌐 ACCESS INSTRUCTIONS")
    print("-" * 30)
    print("1. Local access (this computer):")
    print(f"   http://localhost:{port}")
    print()
    print("2. Network access (other devices):")
    print(f"   http://{ip}:{port}")
    print()
    print("3. Share this information with others on your network")
    print("   so they can access your shared files!")
    print()

def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='LAN File Sharing Web App')
    parser.add_argument('--port', '-p', type=int, default=8080,
                       help='Port to run the server on (default: 8080)')
    parser.add_argument('--host', default='0.0.0.0',
                       help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--debug', action='store_true',
                       help='Run in debug mode')
    parser.add_argument('--folder', '-f', type=str,
                       help='Folder to share immediately on startup')
    
    args = parser.parse_args()
    
    print_banner()
    
    # Get local IP
    local_ip = get_local_ip()
    print_server_info(local_ip, args.port)
    
    # Set environment variables for the Flask app
    os.environ['FLASK_PORT'] = str(args.port)
    os.environ['FLASK_HOST'] = args.host
    if args.debug:
        os.environ['FLASK_DEBUG'] = '1'
    if args.folder:
        os.environ['INITIAL_FOLDER'] = os.path.abspath(args.folder)
    
    print("🚀 STARTING SERVER...")
    print("-" * 30)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        # Import and run the Flask app
        from app import app
        app.run(host=args.host, port=args.port, debug=args.debug)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
        print("Thank you for using LAN File Sharing!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
