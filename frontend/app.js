// ============ GLOBAL STATE ============
let walletConnected = false;
let currentWalletAddress = null;

// ============ WALLET CONNECTION ============
async function connectWallet() {
    try {
        // Check if Midnight Lace wallet is installed
        if (typeof window.midnight !== 'undefined') {
            // Real Lace wallet connection
            const wallet = await window.midnight.enable();
            const address = await wallet.getAddress();
            
            walletConnected = true;
            currentWalletAddress = address;
            
            updateWalletUI(address);
        } else {
            // Mock wallet for demo
            const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
            walletConnected = true;
            currentWalletAddress = mockAddress;
            
            updateWalletUI(mockAddress);
            
            // Show info that this is mock
            showToast('Demo Mode: Wallet connected (mock)', 'info');
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        showToast('Failed to connect wallet', 'error');
    }
}

function updateWalletUI(address) {
    const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    
    document.getElementById('walletBtn').innerHTML = `
        <i class="bi bi-wallet2 me-2"></i>
        <span>${shortAddress}</span>
    `;
    
    document.getElementById('walletStatus').classList.remove('d-none');
    document.getElementById('walletAddress').textContent = shortAddress;
}

// ============ FILE UPLOAD HANDLING ============
const uploadArea = document.getElementById('uploadArea');
const payslipInput = document.getElementById('payslipInput');
const filePreview = document.getElementById('filePreview');

// Click to upload
uploadArea.addEventListener('click', () => {
    payslipInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        payslipInput.files = files;
        handleFileSelect(files[0]);
    }
});

// File selection
payslipInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (file.type !== 'application/pdf') {
        showToast('Please select a PDF file', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be less than 2MB', 'error');
        return;
    }
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    filePreview.classList.remove('d-none');
    uploadArea.style.display = 'none';
}

function removeFile() {
    payslipInput.value = '';
    filePreview.classList.add('d-none');
    uploadArea.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ============ FORM SUBMISSION ============
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Add wallet address if connected
    if (walletConnected) {
        formData.append('walletAddress', currentWalletAddress);
    }
    
    // Show loading state
    document.querySelector('.card-body').classList.add('d-none');
    document.getElementById('loadingState').classList.remove('d-none');
    
    // Simulate loading steps
    await simulateLoading();
    
    try {
        // Call your backend API
        const response = await fetch('http://localhost:3001/api/proof/generate', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Hide loading
        document.getElementById('loadingState').classList.add('d-none');
        document.getElementById('upload-section').classList.add('d-none');
        
        if (result.success && result.verified) {
            // Show success
            displaySuccess(result);
        } else if (result.success && !result.verified) {
            // Show failure reason
            displayError(result.validation.reason);
        } else {
            throw new Error(result.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingState').classList.add('d-none');
        displayError(error.message);
    }
});

// ============ LOADING ANIMATION ============
async function simulateLoading() {
    const steps = [
        { text: 'Analyzing payslip with AI...', progress: 25 },
        { text: 'Extracting data securely...', progress: 50 },
        { text: 'Generating zero-knowledge proof...', progress: 75 },
        { text: 'Creating verification QR code...', progress: 100 }
    ];
    
    for (const step of steps) {
        document.getElementById('loadingStep').textContent = step.text;
        document.getElementById('progressBar').style.width = step.progress + '%';
        await new Promise(resolve => setTimeout(resolve, 800));
    }
}

// ============ DISPLAY RESULTS ============
function displaySuccess(result) {
    // Update result fields
    document.getElementById('resultRequired').textContent = '£' + result.validation.requiredAmount;
    document.getElementById('qrImage').src = result.proof.qrCodeImage;
    document.getElementById('proofKeyDisplay').value = result.proof.proofKey;
    
    // Show success section
    document.getElementById('successSection').classList.remove('d-none');
    document.getElementById('successSection').scrollIntoView({ behavior: 'smooth' });
}

function displayError(message) {
    document.getElementById('errorMessage').innerHTML = `
        <h5>Requirements Not Met</h5>
        <p>${message}</p>
    `;
    
    document.getElementById('errorSection').classList.remove('d-none');
    document.getElementById('errorSection').scrollIntoView({ behavior: 'smooth' });
}

// ============ PROOF KEY ACTIONS ============
function copyProofKey() {
    const proofKey = document.getElementById('proofKeyDisplay');
    proofKey.select();
    document.execCommand('copy');
    
    const copyBtn = document.getElementById('copyBtnText');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
    
    showToast('Proof key copied to clipboard', 'success');
}

function downloadQR() {
    const qrImage = document.getElementById('qrImage');
    const link = document.createElement('a');
    link.download = `eclipseproof-${Date.now()}.png`;
    link.href = qrImage.src;
    link.click();
    
    showToast('QR code downloaded', 'success');
}

function resetForm() {
    // Reset form
    document.getElementById('uploadForm').reset();
    removeFile();
    
    // Hide results
    document.getElementById('successSection').classList.add('d-none');
    document.getElementById('errorSection').classList.add('d-none');
    document.querySelector('.card-body').classList.remove('d-none');
    
    // Show upload section
    document.getElementById('upload-section').classList.remove('d-none');
    document.getElementById('upload-section').scrollIntoView({ behavior: 'smooth' });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed bottom-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <i class="bi bi-${type === 'error' ? 'x-circle' : type === 'success' ? 'check-circle' : 'info-circle'}-fill me-2"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
