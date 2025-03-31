// Product management
let products = [];

async function fetchProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="text-center py-12"><i class="fas fa-spinner fa-spin text-2xl text-green-500"></i></div>';

    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        // Get unique products by both ID and name
        const fetchedProducts = await response.json();
        const productMap = new Map();
        
        fetchedProducts.forEach(product => {
            const key = `${product.id}-${product.name}`;
            if (!productMap.has(key)) {
                productMap.set(key, {
                    ...product,
                    image: product.image_url || product.image
                });
            }
        });
        
        products = Array.from(productMap.values());
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center py-12 text-gray-500">No products available at this time</p>';
            return;
        }
        
        displayProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        container.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-500 mb-2">Failed to load products</p>
                <button onclick="fetchProducts()" class="text-green-500 hover:underline">
                    <i class="fas fa-sync-alt mr-1"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count display
function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            countElement.textContent = totalItems;
            countElement.classList.remove('hidden');
        } else {
            countElement.classList.add('hidden');
        }
    }
}

// Initialize cart count
updateCartCount();

// DOM elements
const productsContainer = document.getElementById('products-container');

// Display products with all database fields
function displayProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = `bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
            product.featured ? 'ring-2 ring-green-500' : ''
        }`;
        
        card.innerHTML = `
            <div class="relative">
                <img src="${product.image_url || product.image}" alt="${product.name}" 
                    class="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    onerror="this.src='https://via.placeholder.com/300?text=Product+Image'">
                
                ${product.featured ? `
                    <span class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                    </span>
                ` : ''}
                
                ${product.stock < 5 ? `
                    <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        ${product.stock === 0 ? 'Sold Out' : 'Low Stock'}
                    </span>
                ` : ''}
            </div>
            
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg truncate">${product.name}</h3>
                    ${product.rating ? `
                        <span class="flex items-center text-sm text-yellow-500">
                            <i class="fas fa-star mr-1"></i>
                            ${product.rating.toFixed(1)}
                        </span>
                    ` : ''}
                </div>
                
                ${product.description ? `
                    <p class="text-gray-600 text-sm mb-3">${product.description}</p>
                ` : ''}
                
                ${product.category ? `
                    <span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mb-3">
                        ${product.category}
                    </span>
                ` : ''}
                
                <div class="flex justify-between items-center mb-3">
                    <span class="text-green-600 font-bold">$${product.price.toFixed(2)}</span>
                    <span class="text-xs text-gray-500">${product.stock} in stock</span>
                </div>
                
                <button onclick="addToCart(${product.id})" 
                    class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-300
                    ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
                    ${product.stock === 0 ? 'disabled' : ''}>
                    ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Add to cart function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${product.name} added to cart`);
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Check authentication status
function checkAuthStatus() {
    const authStatus = document.getElementById('authStatus');
    if (!authStatus) return;

    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    if (token && username) {
        authStatus.innerHTML = `
            <span class="text-gray-600">Welcome, ${username}</span>
            <button onclick="logout()" class="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Smooth scrolling for all anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
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
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    checkAuthStatus();
    initSmoothScrolling();
});
