// File Upload Functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadStatus = document.getElementById('uploadStatus');

    if (uploadArea && fileInput) {
        // Click to upload
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        // File selection
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFiles(e.dataTransfer.files);
        });
    }

    function handleFiles(files) {
        if (files.length === 0) return;

        const formData = new FormData();

        // Add files to form data
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        // Show uploading status
        showUploadStatus('Uploading files...', 'info');

        // Upload files
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showUploadStatus(data.error, 'error');
            } else {
                showUploadStatus(data.message, 'success');
                // Refresh page after successful upload
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        })
        .catch(error => {
            showUploadStatus('Upload failed: ' + error.message, 'error');
        });
    }

    function showUploadStatus(message, type) {
        if (uploadStatus) {
            uploadStatus.textContent = message;
            uploadStatus.className = `upload-status ${type}`;
            uploadStatus.style.display = 'block';

            // Hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    uploadStatus.style.display = 'none';
                }, 5000);
            }
        }
    }
});

// Copy to clipboard functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Show temporary feedback
        const feedback = document.createElement('div');
        feedback.textContent = 'Copied to clipboard!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;

        document.body.appendChild(feedback);
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 2000);
    });
}

// Add copy buttons to IP addresses and URLs
document.addEventListener('DOMContentLoaded', function() {
    const ipElements = document.querySelectorAll('.ip-address, .server-url, .qr-url');

    ipElements.forEach(element => {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '📋';
        copyBtn.className = 'btn btn-small';
        copyBtn.style.marginLeft = '10px';
        copyBtn.onclick = () => copyToClipboard(element.textContent.trim());

        element.parentNode.appendChild(copyBtn);
    });
});

// Auto-refresh file list every 30 seconds
if (window.location.pathname.includes('/browse')) {
    setInterval(() => {
        // Only refresh if no upload is in progress
        const uploadStatus = document.getElementById('uploadStatus');
        if (!uploadStatus || uploadStatus.style.display === 'none') {
            window.location.reload();
        }
    }, 30000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+R or F5 for refresh
    if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
        e.preventDefault();
        window.location.reload();
    }

    // Escape to go back
    if (e.key === 'Escape') {
        const backBtn = document.querySelector('.btn-back');
        if (backBtn) {
            window.location.href = backBtn.href;
        }
    }
});

// Add CSS animation for copy feedback
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Network status checker
function checkNetworkStatus() {
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'networkStatus';
    statusIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        display: none;
    `;
    document.body.appendChild(statusIndicator);

    function updateStatus(online) {
        if (online) {
            statusIndicator.style.background = '#28a745';
            statusIndicator.style.color = 'white';
            statusIndicator.textContent = '🟢 Online';
        } else {
            statusIndicator.style.background = '#dc3545';
            statusIndicator.style.color = 'white';
            statusIndicator.textContent = '🔴 Offline';
        }
        statusIndicator.style.display = 'block';

        setTimeout(() => {
            statusIndicator.style.display = 'none';
        }, 3000);
    }

    window.addEventListener('online', () => updateStatus(true));
    window.addEventListener('offline', () => updateStatus(false));
}

// Initialize network status checker
checkNetworkStatus();

// Mobile-specific enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Detect mobile device
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Add mobile class to body
        document.body.classList.add('mobile-device');

        // Improve touch interactions
        addTouchEnhancements();

        // Handle orientation changes
        handleOrientationChange();

        // Optimize scroll behavior
        optimizeScrolling();

        // Add mobile-specific UI improvements
        addMobileUIEnhancements();
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        const nowMobile = window.innerWidth <= 768;
        if (nowMobile !== isMobile) {
            location.reload(); // Reload to apply proper styles
        }
    });
});

function addTouchEnhancements() {
    // Add touch feedback to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });

        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });

    // Improve file item interactions
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#e9ecef';
        });

        item.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 150);
        });
    });
}

function handleOrientationChange() {
    window.addEventListener('orientationchange', function() {
        // Delay to allow orientation change to complete
        setTimeout(() => {
            // Adjust viewport height for mobile browsers
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);

            // Refresh upload area if needed
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.style.minHeight = 'auto';
            }
        }, 100);
    });
}

function optimizeScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Prevent overscroll on iOS
    document.body.addEventListener('touchmove', function(e) {
        if (e.target === document.body) {
            e.preventDefault();
        }
    }, { passive: false });
}

function addMobileUIEnhancements() {
    // Add mobile-friendly copy buttons
    const copyButtons = document.querySelectorAll('button[onclick*="copyToClipboard"]');
    copyButtons.forEach(button => {
        button.innerHTML = '📋 Copy';
        button.style.fontSize = '12px';
    });

    // Improve form validation messages
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('invalid', function() {
            this.setCustomValidity('This field is required');
        });

        input.addEventListener('input', function() {
            this.setCustomValidity('');
        });
    });

    // Add loading states for buttons
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '⏳ Loading...';
            }
        });
    });

    // Improve breadcrumb navigation on mobile
    const breadcrumb = document.querySelector('.breadcrumb');
    if (breadcrumb && breadcrumb.children.length > 3) {
        // Show only last 2 items on very small screens
        if (window.innerWidth <= 480) {
            const items = Array.from(breadcrumb.children);
            items.forEach((item, index) => {
                if (index < items.length - 4) {
                    item.style.display = 'none';
                }
            });

            // Add ellipsis indicator
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'breadcrumb-ellipsis';
            ellipsis.style.color = '#6c757d';
            ellipsis.style.margin = '0 5px';
            breadcrumb.insertBefore(ellipsis, breadcrumb.children[1]);
        }
    }
}

// Mobile-specific file upload improvements
function enhanceMobileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    if (uploadArea && fileInput) {
        // Add multiple file selection hint for mobile
        const uploadContent = uploadArea.querySelector('.upload-content p');
        if (uploadContent && window.innerWidth <= 768) {
            uploadContent.innerHTML = 'Tap to select files<br><small>You can select multiple files</small>';
        }

        // Improve file input for mobile
        fileInput.setAttribute('accept', '*/*');
        fileInput.setAttribute('capture', 'environment'); // For camera access if needed

        // Add visual feedback for drag operations on mobile
        uploadArea.addEventListener('dragenter', function() {
            this.style.borderColor = '#007bff';
            this.style.backgroundColor = '#f0f8ff';
        });

        uploadArea.addEventListener('dragleave', function() {
            this.style.borderColor = '';
            this.style.backgroundColor = '';
        });
    }
}

// Initialize mobile upload enhancements
document.addEventListener('DOMContentLoaded', enhanceMobileUpload);

// Add viewport height fix for mobile browsers
function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', () => {
    setTimeout(setViewportHeight, 100);
});
