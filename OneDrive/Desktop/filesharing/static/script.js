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

        window.showLoading(); // Show loading indicator
        const formData = new FormData();
        const totalFiles = files.length;

        // Add files to form data
        for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }

        // Show uploading status
        showUploadStatus(`Uploading ${totalFiles} file(s)...`, 'info');

        // Upload files
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            window.hideLoading(); // Hide loading indicator
            if (data.error) {
                showUploadStatus(data.error + (data.details ? '\n' + 
                    data.details.map(r => `${r.filename}: ${r.message}`).join('\n') : ''), 'error');
            } else {
                const successMsg = data.message + '\n' + 
                    data.results.filter(r => r.status === 'success')
                        .map(r => r.filename).join('\n');
                showUploadStatus(successMsg, 'success');
                
                // Refresh page after successful upload
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        })
        .catch(error => {
            window.hideLoading(); // Hide loading on error
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

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Create theme toggle button if it doesn't exist
        if (!document.getElementById('themeToggle')) {
            this.createThemeToggleButton();
        } else {
            this.setupThemeToggle();
        }

        // Listen for system theme changes
        this.listenForSystemThemeChanges();
    }

    createThemeToggleButton() {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        document.body.insertBefore(themeToggle, document.body.firstChild);
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateToggleButton();
        }
    }

    getToggleContent() {
        return this.currentTheme === 'dark' 
            ? '☀️ Light'
            : '🌙 Dark';
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);

        this.applyTheme(this.currentTheme);
        this.updateToggleButton();
        this.animateToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
        
        // Update meta theme color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme === 'dark' ? '#2c3e50' : '#667eea';
        }
    }

    updateToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.getToggleContent();
        }
    }

    animateToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                themeToggle.style.transform = 'scale(1)';
            }, 200);
        }
    }

    listenForSystemThemeChanges() {
        // Check if the browser supports system theme detection
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Initial check
            if (!localStorage.getItem('theme')) {
                this.currentTheme = mediaQuery.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
                this.updateToggleButton();
            }
            
            // Listen for changes
            mediaQuery.addListener((e) => {
                if (!localStorage.getItem('theme')) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.applyTheme(this.currentTheme);
                    this.updateToggleButton();
                }
            });
        }
    }
}

// Initialize theme manager
document.addEventListener('DOMContentLoaded', function() {
    // Create theme toggle button if it doesn't exist
    if (!document.getElementById('themeToggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'themeToggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle theme');
        themeToggle.innerHTML = '🌙 Dark';
        document.body.insertBefore(themeToggle, document.body.firstChild);
    }

    // Initialize theme manager
    const themeManager = new ThemeManager();
});

// Ensure theme toggle is always visible
window.addEventListener('load', function() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.style.display = 'flex';
        themeToggle.style.visibility = 'visible';
        themeToggle.style.opacity = '1';
    }
});

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

// Interactive Sharing Features
class SharingManager {
    constructor() {
        this.updateInterval = null;
        this.heartbeatInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.startHeartbeat();
        this.loadUserIdentity();
    }

    setupEventListeners() {
        // Username management
        const setUsernameBtn = document.getElementById('setUsernameBtn');
        const changeUsernameBtn = document.getElementById('changeUsernameBtn');
        const usernameInput = document.getElementById('usernameInput');

        if (setUsernameBtn) {
            setUsernameBtn.addEventListener('click', () => this.setUsername());
        }

        if (changeUsernameBtn) {
            changeUsernameBtn.addEventListener('click', () => this.showUsernameForm());
        }

        if (usernameInput) {
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.setUsername();
                }
            });
        }

        // Sharing circle interaction
        const sharingCircle = document.getElementById('sharingCircle');
        if (sharingCircle) {
            sharingCircle.addEventListener('click', () => this.handleSharingCircleClick());
        }
    }

    async setUsername() {
        const usernameInput = document.getElementById('usernameInput');
        const username = usernameInput.value.trim();

        if (!username) {
            alert('Please enter a username');
            return;
        }

        try {
            const response = await fetch('/api/set_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username })
            });

            const data = await response.json();

            if (data.success) {
                this.showCurrentIdentity(username);
                localStorage.setItem('username', username);
            } else {
                alert(data.error || 'Failed to set username');
            }
        } catch (error) {
            console.error('Error setting username:', error);
            alert('Failed to set username');
        }
    }

    showCurrentIdentity(username) {
        const identityForm = document.querySelector('.identity-form');
        const currentIdentity = document.getElementById('currentIdentity');
        const currentUsername = document.getElementById('currentUsername');

        if (identityForm) identityForm.style.display = 'none';
        if (currentIdentity) currentIdentity.style.display = 'flex';
        if (currentUsername) currentUsername.textContent = username;
    }

    showUsernameForm() {
        const identityForm = document.querySelector('.identity-form');
        const currentIdentity = document.getElementById('currentIdentity');
        const usernameInput = document.getElementById('usernameInput');

        if (identityForm) identityForm.style.display = 'flex';
        if (currentIdentity) currentIdentity.style.display = 'none';
        if (usernameInput) {
            usernameInput.value = '';
            usernameInput.focus();
        }
    }

    loadUserIdentity() {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            this.showCurrentIdentity(savedUsername);
            // Set username on server
            fetch('/api/set_username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: savedUsername })
            }).catch(console.error);
        }
    }

    handleSharingCircleClick() {
        // Scroll to folder selection section
        const folderSection = document.querySelector('.card');
        if (folderSection) {
            folderSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async updateConnectedUsers() {
        try {
            const response = await fetch('/api/connected_users');
            const data = await response.json();

            this.displayConnectedUsers(data.users);
            this.updateUsersCount(data.total_count);
        } catch (error) {
            console.error('Error fetching connected users:', error);
        }
    }

    displayConnectedUsers(users) {
        const usersList = document.getElementById('usersList');
        const noUsers = document.getElementById('noUsers');

        if (!usersList) return;

        if (users.length === 0) {
            if (noUsers) noUsers.style.display = 'block';
            usersList.innerHTML = '<div class="no-users" id="noUsers">No users connected</div>';
            return;
        }

        if (noUsers) noUsers.style.display = 'none';

        const usersHTML = users.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <div class="user-name">${this.escapeHtml(user.name)}</div>
                    <div class="user-details">IP: ${user.ip}</div>
                    <div class="user-details">${user.current_page}</div>
                </div>
                <div class="user-status">
                    <div class="status-indicator"></div>
                    <span>Online</span>
                </div>
            </div>
        `).join('');

        usersList.innerHTML = usersHTML;
    }

    updateUsersCount(count) {
        const usersCount = document.getElementById('usersCount');
        if (usersCount) {
            usersCount.textContent = count;
        }
    }

    async updateActivities() {
        try {
            const response = await fetch('/api/user_activities');
            const data = await response.json();

            this.displayActivities(data.activities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }

    displayActivities(activities) {
        const activitiesList = document.getElementById('activitiesList');

        if (!activitiesList) return;

        if (activities.length === 0) {
            activitiesList.innerHTML = '<div class="no-activities">No recent activities</div>';
            return;
        }

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-user">${this.escapeHtml(activity.user_name)}</div>
                    <div class="activity-action">${this.escapeHtml(activity.action)}: ${this.escapeHtml(activity.details || '')}</div>
                </div>
                <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
            </div>
        `).join('');

        activitiesList.innerHTML = activitiesHTML;
    }

    startRealTimeUpdates() {
        // Update every 2 seconds
        this.updateInterval = setInterval(() => {
            this.updateConnectedUsers();
            this.updateActivities();
        }, 2000);

        // Initial update
        this.updateConnectedUsers();
        this.updateActivities();

        // Add error recovery
        window.addEventListener('online', () => {
            this.updateConnectedUsers();
            this.updateActivities();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateConnectedUsers();
                this.updateActivities();
            }
        });
    }

    startHeartbeat() {
        // Send heartbeat every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            fetch('/api/heartbeat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            }).catch(console.error);
        }, 30000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
}

// Initialize sharing manager and loading indicator
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sharing manager for all pages
    window.sharingManager = new SharingManager();

    // Initialize loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading...</div>
    `;
    document.body.appendChild(loadingIndicator);
    window.showLoading = () => loadingIndicator.classList.add('show');
    window.hideLoading = () => loadingIndicator.classList.remove('show');
});
