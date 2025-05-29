#!/usr/bin/env python3
"""
Demo script for the LAN File Sharing Web App
This script demonstrates how to use the application programmatically.
"""

import requests
import json
import time
import os

def demo_file_sharing():
    """Demonstrate the file sharing functionality"""
    
    base_url = "http://localhost:8080"
    
    print("🗂️ LAN File Sharing Demo")
    print("=" * 50)
    
    # Test 1: Check server status
    print("\n1. Testing server connectivity...")
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
        else:
            print(f"❌ Server returned status code: {response.status_code}")
            return
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Test 2: Set shared folder
    print("\n2. Setting shared folder...")
    test_folder = os.path.abspath("test_share")
    
    try:
        response = requests.post(
            f"{base_url}/set_folder",
            data={"folder_path": test_folder},
            allow_redirects=False
        )
        if response.status_code == 302:  # Redirect indicates success
            print(f"✅ Shared folder set to: {test_folder}")
        else:
            print(f"❌ Failed to set folder: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error setting folder: {e}")
    
    # Test 3: Browse files
    print("\n3. Testing file browsing...")
    try:
        response = requests.get(f"{base_url}/browse", timeout=5)
        if response.status_code == 200:
            print("✅ File browsing is working")
            # Count files in response
            content = response.text
            file_count = content.count('file-item')
            print(f"   Found {file_count} items in the shared folder")
        else:
            print(f"❌ Browse failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error browsing files: {e}")
    
    # Test 4: Download a file
    print("\n4. Testing file download...")
    try:
        response = requests.get(f"{base_url}/download/sample.txt", timeout=5)
        if response.status_code == 200:
            print("✅ File download is working")
            print(f"   Downloaded {len(response.content)} bytes")
        else:
            print(f"❌ Download failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error downloading file: {e}")
    
    # Test 5: Test connect page
    print("\n5. Testing connect page...")
    try:
        response = requests.get(f"{base_url}/connect", timeout=5)
        if response.status_code == 200:
            print("✅ Connect page is accessible")
        else:
            print(f"❌ Connect page failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accessing connect page: {e}")
    
    # Test 6: Upload functionality (simulate)
    print("\n6. Testing upload endpoint...")
    try:
        # Create a test file to upload
        test_content = b"This is a test upload file"
        files = {'file': ('test_upload.txt', test_content, 'text/plain')}
        
        response = requests.post(f"{base_url}/upload", files=files, timeout=10)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Upload successful: {result.get('message', 'File uploaded')}")
        else:
            print(f"❌ Upload failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing upload: {e}")
    except json.JSONDecodeError:
        print("❌ Upload response was not valid JSON")
    
    print("\n" + "=" * 50)
    print("🎉 Demo completed!")
    print("\nTo use the application:")
    print(f"1. Open your browser and go to: {base_url}")
    print("2. Enter a folder path to share")
    print("3. Share your IP address with others on your network")
    print("4. Others can access your files via the web interface")

if __name__ == "__main__":
    demo_file_sharing()
