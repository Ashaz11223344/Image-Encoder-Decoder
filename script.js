// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Encode elements
const encodeUploadArea = document.getElementById('encodeUploadArea');
const encodeFileInput = document.getElementById('encodeFileInput');
const encodeBrowseBtn = document.getElementById('encodeBrowseBtn');
const encodeOriginalPreview = document.getElementById('encodeOriginalPreview');
const encodeOriginalPlaceholder = document.getElementById('encodeOriginalPlaceholder');
const encodeEncodedPreview = document.getElementById('encodeEncodedPreview');
const encodeEncodedPlaceholder = document.getElementById('encodeEncodedPlaceholder');
const encodePreview = document.getElementById('encodePreview');
const encodeIntensity = document.getElementById('encodeIntensity');
const encodeIntensityValue = document.getElementById('encodeIntensityValue');
const encodeProgress = document.getElementById('encodeProgress');
const encodeProgressFill = document.getElementById('encodeProgressFill');
const encodeProgressText = document.getElementById('encodeProgressText');
const encodeAlert = document.getElementById('encodeAlert');
const encodeBtn = document.getElementById('encodeBtn');
const downloadEncodedBtn = document.getElementById('downloadEncodedBtn');
const resetEncodeBtn = document.getElementById('resetEncodeBtn');

// Decode elements
const decodeUploadArea = document.getElementById('decodeUploadArea');
const decodeFileInput = document.getElementById('decodeFileInput');
const decodeBrowseBtn = document.getElementById('decodeBrowseBtn');
const decodeEncodedPreview = document.getElementById('decodeEncodedPreview');
const decodeEncodedPlaceholder = document.getElementById('decodeEncodedPlaceholder');
const decodeDecodedPreview = document.getElementById('decodeDecodedPreview');
const decodeDecodedPlaceholder = document.getElementById('decodeDecodedPlaceholder');
const decodePreview = document.getElementById('decodePreview');
const decodeProgress = document.getElementById('decodeProgress');
const decodeProgressFill = document.getElementById('decodeProgressFill');
const decodeProgressText = document.getElementById('decodeProgressText');
const decodeAlert = document.getElementById('decodeAlert');
const decodeBtn = document.getElementById('decodeBtn');
const downloadDecodedBtn = document.getElementById('downloadDecodedBtn');
const resetDecodeBtn = document.getElementById('resetDecodeBtn');

// State variables
let currentTheme = localStorage.getItem('theme') || 'light';
let originalImage = null;
let encodedImageUrl = null;
let decodedImageUrl = null;
let encodeCanvas = document.createElement('canvas');
let encodeCtx = encodeCanvas.getContext('2d');
let decodeCanvas = document.createElement('canvas');
let decodeCtx = decodeCanvas.getContext('2d');

// Initialize the app
function init() {
    // Set theme
    setTheme(currentTheme);
    
    // Event listeners for theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Event listeners for tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Encode tab event listeners
    encodeBrowseBtn.addEventListener('click', () => encodeFileInput.click());
    encodeFileInput.addEventListener('change', handleEncodeFileSelect);
    setupDragAndDrop(encodeUploadArea, encodeFileInput, handleEncodeFileSelect);
    
    encodeIntensity.addEventListener('input', updateIntensityValue);
    
    encodeBtn.addEventListener('click', encodeImage);
    downloadEncodedBtn.addEventListener('click', downloadEncodedImage);
    resetEncodeBtn.addEventListener('click', resetEncode);
    
    // Decode tab event listeners
    decodeBrowseBtn.addEventListener('click', () => decodeFileInput.click());
    decodeFileInput.addEventListener('change', handleDecodeFileSelect);
    setupDragAndDrop(decodeUploadArea, decodeFileInput, handleDecodeFileSelect);
    
    decodeBtn.addEventListener('click', decodeImage);
    downloadDecodedBtn.addEventListener('click', downloadDecodedImage);
    resetDecodeBtn.addEventListener('click', resetDecode);
    
    // Initialize with first tab active
    switchTab('encode');
    
    // Update intensity value display
    updateIntensityValue();
}

// Theme functions
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme icon
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// Update the toggleTheme function to use your colors:
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Update the setTheme function:
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme icon with your color scheme
    if (theme === 'dark') {
        themeIcon.className = 'fas fa-sun';
        themeIcon.style.color = 'var(--sunlit-clay)';
    } else {
        themeIcon.className = 'fas fa-moon';
        themeIcon.style.color = 'var(--copperwood)';
    }
}
// Update intensity value display
function updateIntensityValue() {
    const value = parseInt(encodeIntensity.value);
    let text = "";
    
    if (value <= 3) {
        text = "Low";
    } else if (value <= 7) {
        text = "Medium";
    } else {
        text = "High";
    }
    
    encodeIntensityValue.textContent = text;
}

// Tab switching
function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Show active tab content
    tabContents.forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Reset alerts when switching tabs
    hideAlert('encode');
    hideAlert('decode');
}

// Drag and drop setup
function setupDragAndDrop(dropArea, fileInput, fileHandler) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('active-drop');
    }
    
    function unhighlight() {
        dropArea.classList.remove('active-drop');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            
            // Visual feedback that file was dropped
            dropArea.innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                <h3>File uploaded successfully!</h3>
                <p>${files[0].name}</p>
                <button class="btn" id="changeFileBtn">
                    <i class="fas fa-exchange-alt"></i> Change File
                </button>
            `;
            
            // Add event listener to the new button
            setTimeout(() => {
                const changeFileBtn = dropArea.querySelector('#changeFileBtn');
                if (changeFileBtn) {
                    changeFileBtn.addEventListener('click', () => {
                        fileInput.click();
                    });
                }
            }, 100);
            
            // Trigger file handler
            if (fileHandler) {
                const event = new Event('change');
                fileInput.dispatchEvent(event);
            }
        }
    }
}

// File handling for encode
function handleEncodeFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showAlert('encode', 'Please select an image file (JPG, PNG, or WEBP).', 'error');
        return;
    }
    
    // Reset previous state
    resetEncode();
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(event) {
        originalImage = new Image();
        originalImage.onload = function() {
            // Show original preview
            encodeOriginalPreview.src = event.target.result;
            encodeOriginalPreview.style.display = 'block';
            encodeOriginalPlaceholder.style.display = 'none';
            
            // Show preview container
            encodePreview.style.display = 'flex';
            
            // Enable encode button
            encodeBtn.disabled = false;
            
            // Add animation
            encodeOriginalPreview.classList.add('fade-in-scale');
        };
        originalImage.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// File handling for decode
function handleDecodeFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showAlert('decode', 'Please select an image file.', 'error');
        return;
    }
    
    // Reset previous state
    resetDecode();
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(event) {
        // Show encoded preview
        decodeEncodedPreview.src = event.target.result;
        decodeEncodedPreview.style.display = 'block';
        decodeEncodedPlaceholder.style.display = 'none';
        
        // Show preview container
        decodePreview.style.display = 'flex';
        
        // Enable decode button
        decodeBtn.disabled = false;
        
        // Add animation
        decodeEncodedPreview.classList.add('fade-in-scale');
    };
    reader.readAsDataURL(file);
}

// Simple XOR-based encoding algorithm (reversible)
function applyEncodingAlgorithm(pixelData, intensity, encode = true) {
    const data = pixelData.data;
    const intensityFactor = intensity / 5; // Scale factor
    
    // Create a simple deterministic key based on pixel position
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Generate a deterministic key based on pixel position
        const key = (i * 7 + intensity * 11) % 256;
        
        if (encode) {
            // Encoding: XOR with key and add intensity factor
            data[i] = (r ^ key) + intensityFactor * Math.sin(i / 100) * 10;
            data[i + 1] = (g ^ key) + intensityFactor * Math.cos(i / 100) * 10;
            data[i + 2] = (b ^ key) + intensityFactor * Math.sin(i / 50) * 10;
        } else {
            // Decoding: Reverse the operation
            data[i] = (r - intensityFactor * Math.sin(i / 100) * 10) ^ key;
            data[i + 1] = (g - intensityFactor * Math.cos(i / 100) * 10) ^ key;
            data[i + 2] = (b - intensityFactor * Math.sin(i / 50) * 10) ^ key;
        }
        
        // Ensure values stay within 0-255 range
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
    }
    
    return pixelData;
}

// Image encoding
function encodeImage() {
    if (!originalImage) {
        showAlert('encode', 'Please select an image first.', 'error');
        return;
    }
    
    // Show progress
    encodeProgress.style.display = 'block';
    encodeProgressFill.style.width = '10%';
    encodeProgressText.textContent = 'Preparing image...';
    
    try {
        const intensity = parseInt(encodeIntensity.value);
        
        // Set canvas dimensions to image dimensions
        encodeCanvas.width = originalImage.width;
        encodeCanvas.height = originalImage.height;
        
        encodeProgressFill.style.width = '30%';
        encodeProgressText.textContent = 'Drawing image to canvas...';
        
        // Draw image to canvas
        encodeCtx.drawImage(originalImage, 0, 0);
        
        encodeProgressFill.style.width = '50%';
        encodeProgressText.textContent = 'Extracting image data...';
        
        // Get image data
        const imageData = encodeCtx.getImageData(0, 0, encodeCanvas.width, encodeCanvas.height);
        
        encodeProgressFill.style.width = '70%';
        encodeProgressText.textContent = 'Applying encoding algorithm...';
        
        // Apply encoding algorithm
        const encodedImageData = applyEncodingAlgorithm(imageData, intensity, true);
        
        encodeProgressFill.style.width = '85%';
        encodeProgressText.textContent = 'Creating encoded image...';
        
        // Put the encoded data back on the canvas
        encodeCtx.putImageData(encodedImageData, 0, 0);
        
        // Get the data URL for the encoded image
        encodedImageUrl = encodeCanvas.toDataURL('image/png');
        
        encodeProgressFill.style.width = '95%';
        encodeProgressText.textContent = 'Finalizing...';
        
        // Show encoded preview
        encodeEncodedPreview.src = encodedImageUrl;
        encodeEncodedPreview.style.display = 'block';
        encodeEncodedPlaceholder.style.display = 'none';
        encodeEncodedPreview.classList.add('fade-in-scale');
        
        encodeProgressFill.style.width = '100%';
        encodeProgressText.textContent = 'Encoding complete!';
        
        // Enable download button
        downloadEncodedBtn.disabled = false;
        
        // Show success message
        setTimeout(() => {
            showAlert('encode', 'Image successfully encoded! You can now download the noise image.', 'success');
            encodeProgress.style.display = 'none';
        }, 500);
        
    } catch (error) {
        console.error('Encoding error:', error);
        showAlert('encode', 'An error occurred during encoding. Please try again.', 'error');
        encodeProgress.style.display = 'none';
    }
}

// Image decoding
function decodeImage() {
    // Show progress
    decodeProgress.style.display = 'block';
    decodeProgressFill.style.width = '10%';
    decodeProgressText.textContent = 'Loading encoded image...';
    
    try {
        // Load the encoded image
        const encodedImage = new Image();
        encodedImage.src = decodeEncodedPreview.src;
        
        encodedImage.onload = () => {
            decodeProgressFill.style.width = '30%';
            decodeProgressText.textContent = 'Extracting image data...';
            
            // Set canvas to encoded image dimensions
            decodeCanvas.width = encodedImage.width;
            decodeCanvas.height = encodedImage.height;
            decodeCtx.drawImage(encodedImage, 0, 0);
            
            // Get the image data
            const imageData = decodeCtx.getImageData(0, 0, decodeCanvas.width, decodeCanvas.height);
            
            decodeProgressFill.style.width = '50%';
            decodeProgressText.textContent = 'Applying decoding algorithm...';
            
            // Apply decoding algorithm (use medium intensity as default)
            const decodedImageData = applyEncodingAlgorithm(imageData, 5, false);
            
            decodeProgressFill.style.width = '70%';
            decodeProgressText.textContent = 'Creating decoded image...';
            
            // Put the decoded data back on the canvas
            decodeCtx.putImageData(decodedImageData, 0, 0);
            
            // Get the data URL for the decoded image
            decodedImageUrl = decodeCanvas.toDataURL('image/png');
            
            decodeProgressFill.style.width = '85%';
            decodeProgressText.textContent = 'Finalizing...';
            
            // Show decoded preview
            decodeDecodedPreview.src = decodedImageUrl;
            decodeDecodedPreview.style.display = 'block';
            decodeDecodedPlaceholder.style.display = 'none';
            decodeDecodedPreview.classList.add('fade-in-scale');
            
            decodeProgressFill.style.width = '100%';
            decodeProgressText.textContent = 'Decoding successful!';
            
            // Enable download button
            downloadDecodedBtn.disabled = false;
            
            // Show success message
            setTimeout(() => {
                showAlert('decode', 'Image successfully decoded! You can now download the original image.', 'success');
                decodeProgress.style.display = 'none';
            }, 500);
        };
        
        encodedImage.onerror = () => {
            throw new Error('Failed to load image');
        };
        
    } catch (error) {
        console.error('Decoding error:', error);
        showAlert('decode', 'Decoding failed. Make sure this is an image encoded with this tool.', 'error');
        decodeProgress.style.display = 'none';
    }
}

// Download functions
function downloadEncodedImage() {
    if (!encodedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = encodedImageUrl;
    link.download = 'encoded-noise-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadDecodedImage() {
    if (!decodedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = decodedImageUrl;
    link.download = 'decoded-original-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Reset functions
function resetEncode() {
    // Reset file input
    encodeFileInput.value = '';
    
    // Reset previews
    encodeOriginalPreview.src = '';
    encodeOriginalPreview.style.display = 'none';
    encodeOriginalPlaceholder.style.display = 'block';
    
    encodeEncodedPreview.src = '';
    encodeEncodedPreview.style.display = 'none';
    encodeEncodedPlaceholder.style.display = 'block';
    
    // Hide preview container
    encodePreview.style.display = 'none';
    
    // Reset progress and alert
    encodeProgress.style.display = 'none';
    hideAlert('encode');
    
    // Reset buttons
    encodeBtn.disabled = true;
    downloadEncodedBtn.disabled = true;
    
    // Reset upload area text
    encodeUploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Drop your image here</h3>
        <p>or click to browse (JPG, PNG, WEBP)</p>
        <input type="file" id="encodeFileInput" class="file-input" accept="image/jpeg,image/png,image/webp">
        <button class="btn" id="encodeBrowseBtn">
            <i class="fas fa-folder-open"></i> Browse Files
        </button>
    `;
    
    // Reattach event listeners
    const newBrowseBtn = encodeUploadArea.querySelector('#encodeBrowseBtn');
    newBrowseBtn.addEventListener('click', () => encodeFileInput.click());
}

function resetDecode() {
    // Reset file input
    decodeFileInput.value = '';
    
    // Reset previews
    decodeEncodedPreview.src = '';
    decodeEncodedPreview.style.display = 'none';
    decodeEncodedPlaceholder.style.display = 'block';
    
    decodeDecodedPreview.src = '';
    decodeDecodedPreview.style.display = 'none';
    decodeDecodedPlaceholder.style.display = 'block';
    
    // Hide preview container
    decodePreview.style.display = 'none';
    
    // Reset progress and alert
    decodeProgress.style.display = 'none';
    hideAlert('decode');
    
    // Reset buttons
    decodeBtn.disabled = true;
    downloadDecodedBtn.disabled = true;
    
    // Reset upload area text
    decodeUploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Drop your encoded image here</h3>
        <p>or click to browse</p>
        <input type="file" id="decodeFileInput" class="file-input" accept="image/*">
        <button class="btn" id="decodeBrowseBtn">
            <i class="fas fa-folder-open"></i> Browse Files
        </button>
    `;
    
    // Reattach event listeners
    const newBrowseBtn = decodeUploadArea.querySelector('#decodeBrowseBtn');
    newBrowseBtn.addEventListener('click', () => decodeFileInput.click());
}

// Alert functions
function showAlert(tab, message, type) {
    const alertElement = tab === 'encode' ? encodeAlert : decodeAlert;
    
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type}`;
    alertElement.style.display = 'block';
    
    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            hideAlert(tab);
        }, 5000);
    }
}

function hideAlert(tab) {
    const alertElement = tab === 'encode' ? encodeAlert : decodeAlert;
    alertElement.style.display = 'none';
}

// Initialize the app
window.addEventListener('DOMContentLoaded', init);