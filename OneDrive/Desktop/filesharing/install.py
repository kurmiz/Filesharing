#!/usr/bin/env python3
"""
Installation and setup script for LAN File Sharing Web App
This script helps users set up the application quickly.
"""

import os
import sys
import subprocess
import platform

def print_banner():
    """Print installation banner"""
    print("=" * 60)
    print("🗂️  LAN FILE SHARING WEB APP - INSTALLER")
    print("=" * 60)
    print("Setting up your file sharing environment...")
    print()

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Python 3.7 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    
    print(f"✅ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    
    try:
        # Upgrade pip first
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        print("✅ pip upgraded successfully")
        
        # Install requirements
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False
    except FileNotFoundError:
        print("❌ requirements.txt not found")
        return False

def create_sample_folder():
    """Create a sample folder with test files"""
    print("\n📁 Creating sample shared folder...")
    
    sample_dir = "sample_share"
    
    try:
        # Create main directory
        os.makedirs(sample_dir, exist_ok=True)
        
        # Create sample files
        with open(os.path.join(sample_dir, "welcome.txt"), "w") as f:
            f.write("Welcome to LAN File Sharing!\n\n")
            f.write("This is a sample file to test the sharing functionality.\n")
            f.write("You can download this file to verify everything is working.\n\n")
            f.write("Features:\n")
            f.write("- Easy file browsing\n")
            f.write("- Secure downloads\n")
            f.write("- Mobile-friendly interface\n")
            f.write("- QR code sharing\n")
        
        # Create subdirectory
        sub_dir = os.path.join(sample_dir, "documents")
        os.makedirs(sub_dir, exist_ok=True)
        
        with open(os.path.join(sub_dir, "readme.md"), "w") as f:
            f.write("# Sample Document\n\n")
            f.write("This file demonstrates nested folder browsing.\n\n")
            f.write("## Features Tested\n")
            f.write("- Recursive directory listing\n")
            f.write("- Breadcrumb navigation\n")
            f.write("- File type recognition\n")
        
        print(f"✅ Sample folder created: {os.path.abspath(sample_dir)}")
        return os.path.abspath(sample_dir)
        
    except Exception as e:
        print(f"❌ Failed to create sample folder: {e}")
        return None

def test_installation():
    """Test if the installation works"""
    print("\n🧪 Testing installation...")
    
    try:
        # Test imports
        import flask
        import qrcode
        from PIL import Image
        import requests
        
        print("✅ All modules imported successfully")
        
        # Test app import
        from app import app
        print("✅ Flask app loads correctly")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def print_next_steps(sample_folder):
    """Print instructions for next steps"""
    print("\n" + "=" * 60)
    print("🎉 INSTALLATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    
    print("\n🚀 Next Steps:")
    print("1. Start the server:")
    print("   python app.py")
    print("   # or use the enhanced startup:")
    print("   python start_server.py")
    
    print("\n2. Open your browser:")
    print("   http://localhost:8080")
    
    if sample_folder:
        print(f"\n3. Test with sample folder:")
        print(f"   {sample_folder}")
    
    print("\n4. Share with others:")
    print("   - Get your IP address from the web interface")
    print("   - Share the URL with others on your network")
    print("   - Use the QR code for mobile access")
    
    print("\n📖 Documentation:")
    print("   - Read README.md for detailed instructions")
    print("   - Run 'python demo.py' to test all features")
    
    print("\n💡 Tips:")
    print("   - Make sure devices are on the same network")
    print("   - Check firewall settings if others can't connect")
    print("   - Use 'python start_server.py --help' for options")

def main():
    """Main installation function"""
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("\n❌ Installation failed. Please check the errors above.")
        sys.exit(1)
    
    # Create sample folder
    sample_folder = create_sample_folder()
    
    # Test installation
    if not test_installation():
        print("\n⚠️  Installation completed but tests failed.")
        print("   You may still be able to run the application.")
    
    # Print next steps
    print_next_steps(sample_folder)

if __name__ == "__main__":
    main()
