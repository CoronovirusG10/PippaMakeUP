// Admin.js - Admin interface functionality for Pippa of London
// Product management, shade management, and analytics

// Admin authentication
const ADMIN_PASSWORD = 'admin123'; // Demo password
let isAdminAuthenticated = false;

// Initialize admin interface
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    if (isAdminAuthenticated) {
        initializeAdminInterface();
    }
});

// Authentication functions
function checkAdminAuth() {
    const adminSession = sessionStorage.getItem('pippa_admin_session');
    if (adminSession === 'authenticated') {
        isAdminAuthenticated = true;
        showAdminContent();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'block';
    
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('pippa_admin_session', 'authenticated');
            isAdminAuthenticated = true;
            modal.style.display = 'none';
            showAdminContent();
            initializeAdminInterface();
            console.log('Admin login successful');
        } else {
            document.getElementById('loginError').classList.remove('hidden');
        }
    });
}

function showAdminContent() {
    document.getElementById('adminContent').classList.remove('hidden');
    document.getElementById('adminLoginModal').style.display = 'none';
}

function adminLogout() {
    sessionStorage.removeItem('pippa_admin_session');
    isAdminAuthenticated = false;
    window.location.reload();
}

// Initialize admin interface
function initializeAdminInterface() {
    loadDashboardStats();
    loadProductsTable();
    initializeEventListeners();
    initializeCharts();
}

// Dashboard statistics
function loadDashboardStats() {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    
    // Calculate stats
    const totalProducts = products.length;
    const totalShades = products.reduce((sum, p) => sum + p.shades.length, 0);
    const outOfStock = products.reduce((sum, p) => {
        return sum + p.shades.filter(s => !s.inStock).length;
    }, 0);
    
    // Update UI
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalShades').textContent = totalShades;
    document.getElementById('outOfStock').textContent = outOfStock;
}

// Products table
function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const tbody = document.getElementById('adminProductsList');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.productId}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>£${product.price.toFixed(2)}</td>
            <td>${product.shades.length} shades</td>
            <td>
                <span class="status-badge ${product.isActive ? 'active' : 'inactive'}">
                    ${product.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="edit-btn" onclick="editProduct('${product.productId}')">Edit</button>
                <button class="delete-btn" onclick="deleteProduct('${product.productId}')">Delete</button>
                <button class="shades-btn" onclick="manageShades('${product.productId}')">Shades</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Product CRUD operations
function addProduct(productData) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    
    const newProduct = {
        productId: generateUUID(),
        ...productData,
        shades: [],
        createdAt: new Date().toISOString(),
        isActive: true
    };
    
    products.push(newProduct);
    localStorage.setItem('pippa_products', JSON.stringify(products));
    
    console.log('Product added:', newProduct);
    loadProductsTable();
    loadDashboardStats();
    
    return newProduct;
}

function updateProduct(productId, productData) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const index = products.findIndex(p => p.productId === productId);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            ...productData,
            updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem('pippa_products', JSON.stringify(products));
        console.log('Product updated:', products[index]);
        loadProductsTable();
        
        return products[index];
    }
    
    return null;
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    products = products.filter(p => p.productId !== productId);
    
    localStorage.setItem('pippa_products', JSON.stringify(products));
    console.log('Product deleted:', productId);
    loadProductsTable();
    loadDashboardStats();
}

// Shade management
function addShade(productId, shadeData) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const product = products.find(p => p.productId === productId);
    
    if (product) {
        const newShade = {
            shadeId: generateUUID(),
            ...shadeData,
            inStock: true,
            popularity: 5.0
        };
        
        product.shades.push(newShade);
        localStorage.setItem('pippa_products', JSON.stringify(products));
        
        console.log('Shade added:', newShade);
        return newShade;
    }
    
    return null;
}

function updateShade(shadeId, shadeData) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    
    for (const product of products) {
        const shadeIndex = product.shades.findIndex(s => s.shadeId === shadeId);
        if (shadeIndex !== -1) {
            product.shades[shadeIndex] = {
                ...product.shades[shadeIndex],
                ...shadeData
            };
            
            localStorage.setItem('pippa_products', JSON.stringify(products));
            console.log('Shade updated:', product.shades[shadeIndex]);
            return product.shades[shadeIndex];
        }
    }
    
    return null;
}

function deleteShade(shadeId) {
    if (!confirm('Are you sure you want to delete this shade?')) return;
    
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    
    for (const product of products) {
        const shadeIndex = product.shades.findIndex(s => s.shadeId === shadeId);
        if (shadeIndex !== -1) {
            product.shades.splice(shadeIndex, 1);
            localStorage.setItem('pippa_products', JSON.stringify(products));
            console.log('Shade deleted:', shadeId);
            return true;
        }
    }
    
    return false;
}

// UI Functions
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const product = products.find(p => p.productId === productId);
    
    if (!product) return;
    
    // Populate form
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.productId;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSubcategory').value = product.subcategory || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productFeatures').value = product.features.join(', ');
    document.getElementById('productIngredients').value = product.ingredients.join(', ');
    document.getElementById('productStatus').value = product.isActive.toString();
    
    // Set skin types
    document.querySelectorAll('input[name="skinType"]').forEach(cb => {
        cb.checked = product.skinTypes.includes(cb.value);
    });
    
    // Show modal
    document.getElementById('productModal').classList.remove('hidden');
}

function manageShades(productId) {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const product = products.find(p => p.productId === productId);
    
    if (!product) return;
    
    // Switch to shades tab
    document.querySelector('[data-tab="shades"]').click();
    
    // Select product in dropdown
    const select = document.getElementById('productSelectForShades');
    select.value = productId;
    
    // Display shades
    displayProductShades(product);
}

function displayProductShades(product) {
    const container = document.getElementById('shadesList');
    container.innerHTML = `
        <h4>${product.name} - Shade Management</h4>
        <button class="primary-btn" onclick="showAddShadeModal('${product.productId}')">Add New Shade</button>
        <div class="shades-admin-grid">
            ${product.shades.map(shade => `
                <div class="shade-admin-card">
                    <div class="shade-preview">
                        <img src="${window.CatalogAPI.generateSwatch(shade.hexColor, 60)}" alt="${shade.name}">
                    </div>
                    <div class="shade-info">
                        <h5>${shade.name} (${shade.code})</h5>
                        <p>Undertone: ${shade.undertone}</p>
                        <p>Monk Scale: ${shade.monkScale}</p>
                        <p>Stock: ${shade.inStock ? 'Yes' : 'No'}</p>
                    </div>
                    <div class="shade-actions">
                        <button onclick="editShade('${shade.shadeId}')">Edit</button>
                        <button onclick="deleteShade('${shade.shadeId}'); displayProductShades(${JSON.stringify(product).replace(/"/g, '&quot;')})">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    container.classList.remove('hidden');
}

function showAddShadeModal(productId) {
    document.getElementById('shadeModalTitle').textContent = 'Add New Shade';
    document.getElementById('shadeId').value = '';
    document.getElementById('shadeProductId').value = productId;
    document.getElementById('shadeForm').reset();
    document.getElementById('shadeModal').classList.remove('hidden');
}

// Event listeners
function initializeEventListeners() {
    // Logout
    document.getElementById('adminLogout').addEventListener('click', adminLogout);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Update active states
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tab}Tab`).classList.remove('hidden');
        });
    });
    
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModal').classList.remove('hidden');
    });
    
    // Product form submission
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            subcategory: document.getElementById('productSubcategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            description: document.getElementById('productDescription').value,
            features: document.getElementById('productFeatures').value.split(',').map(f => f.trim()),
            ingredients: document.getElementById('productIngredients').value.split(',').map(i => i.trim()),
            skinTypes: Array.from(document.querySelectorAll('input[name="skinType"]:checked')).map(cb => cb.value),
            isActive: document.getElementById('productStatus').value === 'true',
            brand: "Pippa of London",
            currency: "GBP",
            images: {
                main: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400`
            }
        };
        
        const productId = document.getElementById('productId').value;
        if (productId) {
            updateProduct(productId, productData);
        } else {
            addProduct(productData);
        }
        
        closeProductModal();
    });
    
    // Shade form submission
    document.getElementById('shadeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const shadeData = {
            name: document.getElementById('shadeName').value,
            code: document.getElementById('shadeCode').value,
            hexColor: document.getElementById('shadeHexColor').value,
            undertone: document.getElementById('shadeUndertone').value,
            coverage: document.getElementById('shadeCoverage').value,
            lab: {
                L: parseFloat(document.getElementById('labL').value),
                a: parseFloat(document.getElementById('labA').value),
                b: parseFloat(document.getElementById('labB').value)
            },
            monkScale: parseInt(document.getElementById('monkScale').value),
            fitzpatrickScale: parseInt(document.getElementById('fitzpatrickScale').value),
            inStock: document.getElementById('shadeInStock').value === 'true',
            popularity: parseFloat(document.getElementById('shadePopularity').value)
        };
        
        const shadeId = document.getElementById('shadeId').value;
        const productId = document.getElementById('shadeProductId').value;
        
        if (shadeId) {
            updateShade(shadeId, shadeData);
        } else {
            addShade(productId, shadeData);
        }
        
        closeShadeModal();
        
        // Refresh shades display
        const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
        const product = products.find(p => p.productId === productId);
        if (product) {
            displayProductShades(product);
        }
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.add('hidden');
        });
    });
    
    // Color picker sync
    document.getElementById('shadeHexColor').addEventListener('input', function() {
        document.getElementById('shadeHexText').value = this.value;
        updateShadePreview(this.value);
    });
    
    document.getElementById('shadeHexText').addEventListener('input', function() {
        if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
            document.getElementById('shadeHexColor').value = this.value;
            updateShadePreview(this.value);
        }
    });
    
    // Product selection for shades
    document.getElementById('productSelectForShades').addEventListener('change', function() {
        const productId = this.value;
        if (productId) {
            const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
            const product = products.find(p => p.productId === productId);
            if (product) {
                displayProductShades(product);
            }
        }
    });
    
    // Search and filters
    document.getElementById('adminSearch').addEventListener('input', debounce(filterProductsTable, 300));
    document.getElementById('adminCategoryFilter').addEventListener('change', filterProductsTable);
    
    // Export data
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    
    // Bulk import
    document.getElementById('bulkImportBtn').addEventListener('click', showBulkImportModal);
}

// Helper functions
function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

function closeShadeModal() {
    document.getElementById('shadeModal').classList.add('hidden');
}

function updateShadePreview(hexColor) {
    const preview = document.getElementById('shadePreview');
    preview.style.backgroundColor = hexColor;
}

function filterProductsTable() {
    const searchTerm = document.getElementById('adminSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('adminCategoryFilter').value;
    
    const rows = document.querySelectorAll('#adminProductsList tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const category = row.cells[2].textContent.toLowerCase();
        
        const matchesSearch = !searchTerm || name.includes(searchTerm);
        const matchesCategory = !categoryFilter || category === categoryFilter;
        
        row.style.display = matchesSearch && matchesCategory ? '' : 'none';
    });
}

function exportData() {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pippa-products-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function showBulkImportModal() {
    alert('Bulk import feature coming soon! For now, use the Add Product button to add products one by one.');
}

// Analytics charts (simplified for prototype)
function initializeCharts() {
    // These would use Chart.js or similar in a real implementation
    // For prototype, just log the data
    
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    
    // Category distribution
    const categoryCount = {};
    products.forEach(p => {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });
    console.log('Category distribution:', categoryCount);
    
    // Undertone distribution
    const undertoneCount = { cool: 0, warm: 0, neutral: 0 };
    products.forEach(p => {
        p.shades.forEach(s => {
            undertoneCount[s.undertone]++;
        });
    });
    console.log('Undertone distribution:', undertoneCount);
    
    // Price range analysis
    const priceRanges = { '0-20': 0, '20-30': 0, '30-40': 0, '40+': 0 };
    products.forEach(p => {
        if (p.price < 20) priceRanges['0-20']++;
        else if (p.price < 30) priceRanges['20-30']++;
        else if (p.price < 40) priceRanges['30-40']++;
        else priceRanges['40+']++;
    });
    console.log('Price ranges:', priceRanges);
}

// Utility function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Populate product dropdown for shade management
function populateProductDropdown() {
    const products = JSON.parse(localStorage.getItem('pippa_products') || '[]');
    const select = document.getElementById('productSelectForShades');
    
    select.innerHTML = '<option value="">Select a product</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.productId;
        option.textContent = `${product.name} (${product.category})`;
        select.appendChild(option);
    });
}

// Initialize dropdown on load
if (document.getElementById('productSelectForShades')) {
    populateProductDropdown();
}