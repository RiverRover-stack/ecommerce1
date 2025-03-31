// Sample product data (will be replaced with API calls later)
const products = [
    {
        id: 1,
        name: "Classic White Sneakers",
        price: 89.99,
        description: "Timeless white sneakers for everyday wear",
        image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
        category: "sneakers"
    },
    {
        id: 2,
        name: "Leather Oxford Shoes",
        price: 129.99,
        description: "Premium leather oxfords for formal occasions",
        image: "https://images.pexels.com/photos/19090/pexels-photo.jpg",
        category: "formal"
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 109.99,
        description: "High-performance running shoes with cushioning",
        image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg",
        category: "sports"
    },
    {
        id: 4,
        name: "Canvas Slip-ons",
        price: 49.99,
        description: "Comfortable casual slip-on shoes",
        image: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
        category: "casual"
    }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const productsContainer = document.getElementById('products-container');

// Display products
function displayProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="font-semibold text-lg mb-2">${product.name}</h3>
                <p class="text-gray-600 mb-2">$${product.price.toFixed(2)}</p>
                <button onclick="addToCart(${product.id})" class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300">
                    Add to Cart
                </button>
            </div>
        `;
        productsContainer.appendChild(productCard);
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

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
});