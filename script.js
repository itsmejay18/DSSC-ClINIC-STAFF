// Global state management
let currentSection = 'profile';
let inventory = [];
let transactions = [];
let activityLog = [];
let currentProfile = {
    name: '',
    department: '',
    contact: '',
    email: '',
    picture: ''
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    initializeNavigation();
    initializeModals();
    initializeForms();
    loadStudentOptions();
    updateInventoryDisplay();
    updateTransactionDisplay();
    updateMonitoring();
    updateNotifications();
    
    // Initialize barcode scanner
    barcodeScanner = new BarcodeScanner();
    
    // Load profile display
    displayProfile();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');

    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionName = this.getAttribute('data-section');
            switchSection(sectionName);
            
            // Close mobile menu
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
}

function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}Section`).classList.add('active');

    currentSection = sectionName;
    
    // Update displays when switching sections
    if (sectionName === 'inventory') {
        updateInventoryDisplay();
    } else if (sectionName === 'transactions') {
        updateTransactionDisplay();
        loadDrugOptions();
    } else if (sectionName === 'monitoring') {
        updateMonitoring();
    }
}

// Modal functionality
function initializeModals() {
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.style.display = 'none';
    
    // Special cleanup for barcode scanner
    if (modalId === 'barcodeScanModal' && barcodeScanner) {
        barcodeScanner.stopScanning();
        resetBarcodeScanner();
    }
}

// Form initialization
function initializeForms() {
    // Add drug form
    document.getElementById('addDrugForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addDrugManual();
    });

    // Scanned drug form
    document.getElementById('scannedDrugForm').addEventListener('submit', function(event) {
        event.preventDefault();
        addDrugFromScan();
    });

    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', function(event) {
        event.preventDefault();
        recordTransaction();
    });

    // Profile picture upload
    document.getElementById('profilePictureInput').addEventListener('change', function(event) {
        handleProfilePictureUpload(event);
    });

    // Search functionality
    document.getElementById('inventorySearch').addEventListener('input', function() {
        filterInventory();
    });

    document.getElementById('categoryFilter').addEventListener('change', function() {
        filterInventory();
    });

    document.getElementById('studentSearch').addEventListener('input', function() {
        filterTransactions();
    });
}

// Profile management
function displayProfile() {
    document.getElementById('staffName').value = currentProfile.name || '';
    document.getElementById('staffDepartment').value = currentProfile.department || '';
    document.getElementById('staffContact').value = currentProfile.contact || '';
    document.getElementById('staffEmail').value = currentProfile.email || '';
    
    if (currentProfile.picture) {
        document.getElementById('profileImage').src = currentProfile.picture;
    }
}

function saveProfile() {
    currentProfile.name = document.getElementById('staffName').value;
    currentProfile.department = document.getElementById('staffDepartment').value;
    currentProfile.contact = document.getElementById('staffContact').value;
    currentProfile.email = document.getElementById('staffEmail').value;
    
    saveToStorage();
    addActivityLog(ACTIVITY_TYPES.PROFILE_UPDATED, 'Profile information updated');
    showNotification('Profile saved successfully!', 'success');
}

function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            currentProfile.picture = imageUrl;
            document.getElementById('profileImage').src = imageUrl;
            saveToStorage();
            showNotification('Profile picture updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Drug management
function showAddDrugModal() {
    showModal('addDrugModal');
}

function addDrugManual() {
    const drugData = {
        id: 'drug_' + Date.now(),
        drug_name: document.getElementById('drugName').value,
        brand: document.getElementById('drugBrand').value,
        category: document.getElementById('drugCategory').value,
        strength: document.getElementById('drugStrength').value,
        quantity: parseInt(document.getElementById('drugQuantity').value),
        expiry_date: document.getElementById('drugExpiry').value,
        date_added: new Date().toISOString().split('T')[0]
    };

    inventory.push(drugData);
    saveToStorage();
    updateInventoryDisplay();
    updateMonitoring();
    updateNotifications();
    
    addActivityLog(ACTIVITY_TYPES.DRUG_ADDED, `Added ${drugData.drug_name} (${drugData.brand})`);
    showNotification('Drug added successfully!', 'success');
    
    // Reset form and close modal
    document.getElementById('addDrugForm').reset();
    closeModal('addDrugModal');
}

// Barcode scanning
function showBarcodeScanModal() {
    showModal('barcodeScanModal');
    
    // Initialize barcode scanner
    const video = document.getElementById('barcodeVideo');
    const canvas = document.getElementById('barcodeCanvas');
    
    barcodeScanner.init(video, canvas).then(success => {
        if (success) {
            barcodeScanner.startScanning(handleBarcodeScanned);
        }
    });
}

function handleBarcodeScanned(barcode) {
    // Look up drug info in database
    const drugInfo = DRUG_DATABASE[barcode];
    
    if (drugInfo) {
        // Populate form with drug info
        document.getElementById('scannedBarcode').textContent = barcode;
        document.getElementById('scannedDrugName').value = drugInfo.drug_name;
        document.getElementById('scannedDrugBrand').value = drugInfo.brand;
        document.getElementById('scannedDrugCategory').value = drugInfo.category;
        document.getElementById('scannedDrugStrength').value = drugInfo.strength;
        document.getElementById('scannedDrugExpiry').value = drugInfo.expiry_date;
        
        // Show scanned info form
        document.querySelector('.barcode-scanner').style.display = 'none';
        document.getElementById('barcodeActions').style.display = 'none';
        document.getElementById('scannedInfo').style.display = 'block';
    } else {
        showNotification('Barcode not found in database', 'warning');
    }
}

function simulateBarcodeScan() {
    if (barcodeScanner) {
        barcodeScanner.simulateScan();
    }
}

function resetBarcodeScanner() {
    document.querySelector('.barcode-scanner').style.display = 'block';
    document.getElementById('barcodeActions').style.display = 'flex';
    document.getElementById('scannedInfo').style.display = 'none';
    document.getElementById('scannedDrugForm').reset();
    
    // Restart scanner
    const video = document.getElementById('barcodeVideo');
    const canvas = document.getElementById('barcodeCanvas');
    
    barcodeScanner.init(video, canvas).then(success => {
        if (success) {
            barcodeScanner.startScanning(handleBarcodeScanned);
        }
    });
}

function addDrugFromScan() {
    const drugData = {
        id: 'drug_' + Date.now(),
        drug_name: document.getElementById('scannedDrugName').value,
        brand: document.getElementById('scannedDrugBrand').value,
        category: document.getElementById('scannedDrugCategory').value,
        strength: document.getElementById('scannedDrugStrength').value,
        quantity: parseInt(document.getElementById('scannedDrugQuantity').value),
        expiry_date: document.getElementById('scannedDrugExpiry').value,
        date_added: new Date().toISOString().split('T')[0]
    };

    inventory.push(drugData);
    saveToStorage();
    updateInventoryDisplay();
    updateMonitoring();
    updateNotifications();
    
    addActivityLog(ACTIVITY_TYPES.DRUG_ADDED, `Added ${drugData.drug_name} (${drugData.brand}) via barcode scan`);
    showNotification('Drug added from barcode scan!', 'success');
    
    closeModal('barcodeScanModal');
}

// Inventory display and management
function updateInventoryDisplay() {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';

    inventory.forEach(drug => {
        const status = getDrugStatus(drug);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${drug.drug_name}</td>
            <td>${drug.brand}</td>
            <td>${drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}</td>
            <td>${drug.strength}</td>
            <td>${drug.quantity}</td>
            <td>${formatDate(drug.expiry_date)}</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editDrug('${drug.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteDrug('${drug.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function getDrugStatus(drug) {
    const today = new Date();
    const expiryDate = new Date(drug.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0) {
        return { class: 'status-expired', text: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
        return { class: 'status-warning', text: 'Expiring Soon' };
    } else if (drug.quantity < 5) {
        return { class: 'status-low-stock', text: 'Low Stock' };
    } else {
        return { class: 'status-active', text: 'Active' };
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const filteredInventory = inventory.filter(drug => {
        const matchesSearch = drug.drug_name.toLowerCase().includes(searchTerm) ||
                             drug.brand.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || drug.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    updateInventoryDisplayWithData(filteredInventory);
}

function updateInventoryDisplayWithData(data) {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';

    data.forEach(drug => {
        const status = getDrugStatus(drug);
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${drug.drug_name}</td>
            <td>${drug.brand}</td>
            <td>${drug.category.charAt(0).toUpperCase() + drug.category.slice(1)}</td>
            <td>${drug.strength}</td>
            <td>${drug.quantity}</td>
            <td>${formatDate(drug.expiry_date)}</td>
            <td><span class="status-badge ${status.class}">${status.text}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editDrug('${drug.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteDrug('${drug.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function editDrug(drugId) {
    // Implementation for editing drugs
    const drug = inventory.find(d => d.id === drugId);
    if (drug) {
        // Pre-populate modal with drug data
        document.getElementById('drugName').value = drug.drug_name;
        document.getElementById('drugBrand').value = drug.brand;
        document.getElementById('drugCategory').value = drug.category;
        document.getElementById('drugStrength').value = drug.strength;
        document.getElementById('drugQuantity').value = drug.quantity;
        document.getElementById('drugExpiry').value = drug.expiry_date;
        
        // Store drug ID for update
        document.getElementById('addDrugForm').dataset.editingId = drugId;
        
        showModal('addDrugModal');
    }
}

function deleteDrug(drugId) {
    if (confirm('Are you sure you want to delete this drug?')) {
        const drugIndex = inventory.findIndex(d => d.id === drugId);
        if (drugIndex > -1) {
            const drug = inventory[drugIndex];
            inventory.splice(drugIndex, 1);
            saveToStorage();
            updateInventoryDisplay();
            updateMonitoring();
            updateNotifications();
            
            addActivityLog(ACTIVITY_TYPES.DRUG_DISPOSED, `Deleted ${drug.drug_name} (${drug.brand})`);
            showNotification('Drug deleted successfully!', 'success');
        }
    }
}

// Transaction management
function showNewTransactionModal() {
    loadStudentOptions();
    loadDrugOptions();
    showModal('transactionModal');
}

function loadStudentOptions() {
    const studentSelect = document.getElementById('transactionStudent');
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    STUDENTS_DATABASE.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.id})`;
        studentSelect.appendChild(option);
    });
}

function loadDrugOptions() {
    const drugSelect = document.getElementById('transactionDrug');
    drugSelect.innerHTML = '<option value="">Select Drug</option>';
    
    // Only show drugs with quantity > 0
    inventory.filter(drug => drug.quantity > 0).forEach(drug => {
        const option = document.createElement('option');
        option.value = drug.id;
        option.textContent = `${drug.drug_name} (${drug.brand}) - Available: ${drug.quantity}`;
        drugSelect.appendChild(option);
    });
}

function recordTransaction() {
    const studentId = document.getElementById('transactionStudent').value;
    const drugId = document.getElementById('transactionDrug').value;
    const quantity = parseInt(document.getElementById('transactionQuantity').value);
    const notes = document.getElementById('transactionNotes').value;
    
    const student = STUDENTS_DATABASE.find(s => s.id === studentId);
    const drug = inventory.find(d => d.id === drugId);
    
    if (!student || !drug) {
        showNotification('Please select valid student and drug', 'error');
        return;
    }
    
    if (quantity > drug.quantity) {
        showNotification('Not enough stock available', 'error');
        return;
    }
    
    // Create transaction
    const transaction = {
        id: 'trans_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        student_id: studentId,
        student_name: student.name,
        drug_id: drugId,
        drug_name: drug.drug_name,
        drug_brand: drug.brand,
        quantity: quantity,
        notes: notes,
        status: 'Completed'
    };
    
    // Update drug quantity
    drug.quantity -= quantity;
    
    // Add transaction
    transactions.push(transaction);
    
    // Save and update displays
    saveToStorage();
    updateInventoryDisplay();
    updateTransactionDisplay();
    updateMonitoring();
    updateNotifications();
    
    addActivityLog(ACTIVITY_TYPES.TRANSACTION_RECORDED, `Issued ${quantity} ${drug.drug_name} to ${student.name}`);
    showNotification('Transaction recorded successfully!', 'success');
    
    // Reset form and close modal
    document.getElementById('transactionForm').reset();
    closeModal('transactionModal');
}

function updateTransactionDisplay() {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactions.slice().reverse().forEach(transaction => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.student_id}</td>
            <td>${transaction.student_name}</td>
            <td>${transaction.drug_name} (${transaction.drug_brand})</td>
            <td>${transaction.quantity}</td>
            <td><span class="status-badge status-active">${transaction.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewTransaction('${transaction.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function filterTransactions() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    
    const filteredTransactions = transactions.filter(transaction => {
        return transaction.student_name.toLowerCase().includes(searchTerm) ||
               transaction.student_id.toLowerCase().includes(searchTerm) ||
               transaction.drug_name.toLowerCase().includes(searchTerm);
    });
    
    updateTransactionDisplayWithData(filteredTransactions);
}

function updateTransactionDisplayWithData(data) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    data.slice().reverse().forEach(transaction => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.student_id}</td>
            <td>${transaction.student_name}</td>
            <td>${transaction.drug_name} (${transaction.drug_brand})</td>
            <td>${transaction.quantity}</td>
            <td><span class="status-badge status-active">${transaction.status}</span></td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewTransaction('${transaction.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function viewTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        alert(`Transaction Details:\n\nDate: ${formatDate(transaction.date)}\nStudent: ${transaction.student_name} (${transaction.student_id})\nDrug: ${transaction.drug_name} (${transaction.drug_brand})\nQuantity: ${transaction.quantity}\nNotes: ${transaction.notes || 'N/A'}`);
    }
}

// Monitoring and alerts
function updateMonitoring() {
    updateExpiryAlerts();
    updateLowStockAlerts();
    updateActivityLog();
}

function updateExpiryAlerts() {
    const today = new Date();
    const expiringDrugs = inventory.filter(drug => {
        const expiryDate = new Date(drug.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    });
    
    document.getElementById('expiryAlertCount').textContent = expiringDrugs.length;
    
    const alertList = document.getElementById('expiryAlertList');
    alertList.innerHTML = '';
    
    expiringDrugs.forEach(drug => {
        const expiryDate = new Date(drug.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <strong>${drug.drug_name} (${drug.brand})</strong><br>
            Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} (${formatDate(drug.expiry_date)})
        `;
        alertList.appendChild(alertItem);
    });
}

function updateLowStockAlerts() {
    const lowStockDrugs = inventory.filter(drug => drug.quantity < 5);
    
    document.getElementById('lowStockAlertCount').textContent = lowStockDrugs.length;
    
    const alertList = document.getElementById('lowStockAlertList');
    alertList.innerHTML = '';
    
    lowStockDrugs.forEach(drug => {
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item';
        alertItem.innerHTML = `
            <strong>${drug.drug_name} (${drug.brand})</strong><br>
            Only ${drug.quantity} remaining
        `;
        alertList.appendChild(alertItem);
    });
}

function updateActivityLog() {
    const activityLogContainer = document.getElementById('activityLog');
    activityLogContainer.innerHTML = '';
    
    activityLog.slice(-10).reverse().forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div>${activity.action}</div>
            <div>${activity.description}</div>
            <div class="activity-time">${formatDateTime(activity.timestamp)}</div>
        `;
        activityLogContainer.appendChild(activityItem);
    });
}

function updateNotifications() {
    const today = new Date();
    const expiringCount = inventory.filter(drug => {
        const expiryDate = new Date(drug.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length;
    
    const lowStockCount = inventory.filter(drug => drug.quantity < 5).length;
    const totalAlerts = expiringCount + lowStockCount;
    
    document.getElementById('notificationBadge').textContent = totalAlerts;
}

// Utility functions
function addActivityLog(action, description) {
    activityLog.push({
        action,
        description,
        timestamp: new Date().toISOString(),
        user: currentProfile.name || 'Staff Member'
    });
    saveToStorage();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--primary-blue)'};
        padding: 1rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        z-index: 3000;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Local storage functions
function saveToStorage() {
    localStorage.setItem('dssc_clinic_profile', JSON.stringify(currentProfile));
    localStorage.setItem('dssc_clinic_inventory', JSON.stringify(inventory));
    localStorage.setItem('dssc_clinic_transactions', JSON.stringify(transactions));
    localStorage.setItem('dssc_clinic_activity', JSON.stringify(activityLog));
}

function loadFromStorage() {
    // Load profile
    const storedProfile = localStorage.getItem('dssc_clinic_profile');
    if (storedProfile) {
        currentProfile = JSON.parse(storedProfile);
    }
    
    // Load inventory
    const storedInventory = localStorage.getItem('dssc_clinic_inventory');
    if (storedInventory) {
        inventory = JSON.parse(storedInventory);
    } else {
        // Load initial sample data
        inventory = [...INITIAL_INVENTORY];
        saveToStorage();
    }
    
    // Load transactions
    const storedTransactions = localStorage.getItem('dssc_clinic_transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
    
    // Load activity log
    const storedActivity = localStorage.getItem('dssc_clinic_activity');
    if (storedActivity) {
        activityLog = JSON.parse(storedActivity);
    }
}

// Add CSS for notifications
const notificationCSS = document.createElement('style');
notificationCSS.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-grow: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--gray-dark);
        padding: 0;
        margin-left: 1rem;
    }
    
    .notification-close:hover {
        color: var(--danger);
    }
`;
document.head.appendChild(notificationCSS);