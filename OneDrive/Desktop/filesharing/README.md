# 🗂️ LAN File Sharing Web App

A simple and secure Flask-based web application for sharing files across your local network (LAN). Perfect for quickly sharing files between devices on the same WiFi network without needing cloud services or USB drives.

## ✨ Features

- **📁 Folder Selection**: Choose any folder on your computer to share
- **🌐 LAN Access**: Accessible by other devices on the same network
- **📱 QR Code**: Generate QR codes for easy mobile access
- **📂 File Browser**: Navigate through folders and download files
- **📤 File Upload**: Upload files to the shared folder
- **🔗 Connect to Others**: Access files shared by others on your network
- **📋 Recent Connections**: Keep track of previously accessed servers
- **🔄 Auto-refresh**: File list updates automatically
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### 1. Install Dependencies

**Automatic Installation (Recommended):**

```bash
python install.py
```

**Manual Installation:**

```bash
pip install -r requirements.txt
```

### 2. Run the Application

**Basic Usage:**

```bash
python app.py
```

**Enhanced Startup (Recommended):**

```bash
python start_server.py --port 8080 --folder "C:\MyFiles"
```

**Available Options:**

```bash
python start_server.py --help
```

### 3. Access the Web Interface

Open your browser and go to:

- **Local access**: `http://localhost:8080`
- **Network access**: `http://YOUR_IP:8080` (shown in the terminal)

### 4. Demo and Testing

Run the demo script to test all functionality:

```bash
python demo.py
```

## 📖 How to Use

### Sharing Files

1. **Start the Server**: Run `python app.py`
2. **Select Folder**: Enter the path to the folder you want to share
3. **Share Your IP**: Give others your IP address and port (displayed on the main page)
4. **Access Files**: Others can browse and download your files

### Accessing Others' Files

1. **Get Connection Info**: Ask for their IP address and port
2. **Connect**: Use the "Connect to Others" page to enter their details
3. **Browse**: Navigate their shared folders and download files

## 🔧 Configuration

### Change Port

Edit the `port` variable in `app.py`:

```python
port = 8080  # Change to your preferred port
```

### Security Notes

- **LAN Only**: The server binds to `0.0.0.0` but is intended for LAN use only
- **No Authentication**: Basic version has no password protection
- **Safe Paths**: File access is restricted to the shared folder only
- **Secure Downloads**: Uses Flask's `send_from_directory` for safe file serving

## 📁 Project Structure

```
filesharing/
├── app.py              # Main Flask application
├── utils.py            # Utility functions (IP detection, QR codes, etc.)
├── start_server.py     # Enhanced startup script with options
├── demo.py            # Demo and testing script
├── install.py         # Automatic installation script
├── requirements.txt    # Python dependencies
├── README.md          # This comprehensive documentation
├── templates/          # HTML templates
│   ├── index.html      # Main page with folder selection
│   ├── browse.html     # File browser interface
│   └── connect.html    # Connection page for accessing others
├── static/             # Static assets
│   ├── style.css       # Modern responsive styling
│   └── script.js       # JavaScript functionality
├── test_share/         # Example shared folder (for testing)
│   ├── sample.txt      # Sample file
│   ├── test_upload.txt  # Uploaded test file
│   └── subfolder/      # Nested directory example
│       └── nested_file.md
└── sample_share/       # Created by install.py
    ├── welcome.txt     # Welcome message
    └── documents/      # Sample subdirectory
        └── readme.md   # Sample markdown file
```

## 🛠️ Technical Details

### Dependencies

- **Flask**: Web framework for the server
- **qrcode**: QR code generation for easy mobile access
- **Pillow**: Image processing for QR codes
- **requests**: HTTP client for testing connections and remote access

### Key Features Implementation

- **IP Detection**: Automatically detects local IP address
- **File Security**: Path validation prevents directory traversal attacks
- **Drag & Drop**: Modern file upload with drag and drop support
- **Responsive UI**: Mobile-friendly interface with modern CSS
- **Error Handling**: Comprehensive error handling and user feedback

## 🔒 Security Considerations

1. **Network Scope**: Only use on trusted local networks
2. **Folder Permissions**: Ensure shared folders don't contain sensitive data
3. **Firewall**: Consider firewall rules if needed
4. **Temporary Use**: Intended for temporary file sharing sessions

## 🐛 Troubleshooting

### Common Issues

1. **Can't Access from Other Devices**

   - Check if devices are on the same network
   - Verify firewall settings
   - Ensure the correct IP address is being used

2. **Upload Fails**

   - Check folder permissions
   - Ensure sufficient disk space
   - Verify the shared folder path is correct

3. **Connection Refused**
   - Confirm the server is running
   - Check if the port is already in use
   - Verify the IP address and port are correct

### Getting Your IP Address

The app automatically detects your IP, but you can also find it manually:

**Windows:**

```cmd
ipconfig
```

**Mac/Linux:**

```bash
ifconfig
```

Look for addresses starting with:

- `192.168.x.x`
- `10.x.x.x`
- `172.16.x.x` to `172.31.x.x`

## 🎯 Use Cases

### Home Network File Sharing

- Share photos, videos, and documents between family devices
- Transfer files from phone to computer without cables
- Share media files for streaming on different devices

### Office/Work Environment

- Quick file sharing during meetings
- Temporary document sharing without email
- Collaborative file access for team projects

### Development and Testing

- Share build artifacts between development machines
- Transfer log files and debug information
- Quick deployment of files to test devices

## 🔧 Advanced Usage

### Command Line Options

The enhanced startup script supports various options:

```bash
# Start with custom port
python start_server.py --port 9000

# Start with pre-selected folder
python start_server.py --folder "/path/to/share"

# Enable debug mode
python start_server.py --debug

# Bind to specific host
python start_server.py --host 192.168.1.100

# Combine options
python start_server.py --port 8080 --folder "C:\Documents" --debug
```

### Environment Variables

You can also configure the app using environment variables:

```bash
# Windows
set FLASK_PORT=8080
set INITIAL_FOLDER=C:\MyFiles
python app.py

# Linux/Mac
export FLASK_PORT=8080
export INITIAL_FOLDER=/home/user/files
python app.py
```

### API Endpoints

The application provides REST API endpoints for programmatic access:

- `GET /` - Main interface
- `POST /set_folder` - Set shared folder
- `GET /browse[/path]` - Browse files
- `GET /download/<filename>` - Download file
- `POST /upload` - Upload file
- `GET /connect` - Connection interface
- `POST /connect_to` - Connect to remote server

## 🚀 Future Enhancements

- [ ] Password protection for shared folders
- [ ] User authentication system
- [ ] File preview capabilities
- [ ] Bandwidth limiting
- [ ] Network discovery/scanning
- [ ] File compression for downloads
- [ ] Upload progress indicators
- [ ] Multiple folder sharing
- [ ] File synchronization

## 📊 Performance Notes

- **File Size Limits**: No built-in limits, but consider network bandwidth
- **Concurrent Users**: Flask development server supports multiple connections
- **Memory Usage**: Minimal memory footprint, scales with file operations
- **Network Speed**: Transfer speed depends on local network capabilities

## 🔍 Testing

The project includes comprehensive testing capabilities:

### Automated Testing

```bash
# Run the demo script to test all features
python demo.py
```

### Manual Testing Checklist

- [ ] Server starts successfully
- [ ] IP address is detected correctly
- [ ] Folder selection works
- [ ] File browsing displays correctly
- [ ] File downloads work
- [ ] File uploads function properly
- [ ] QR code generates
- [ ] Connect to others page loads
- [ ] Responsive design on mobile

## 📱 Mobile Access

The application is fully responsive and works great on mobile devices:

1. **QR Code Access**: Scan the QR code with your phone's camera
2. **Mobile Browser**: Enter the server URL directly
3. **Touch Interface**: All buttons and controls are touch-friendly
4. **File Upload**: Use your phone's file picker to upload photos/documents

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this application.

---

**Happy File Sharing! 🎉**
