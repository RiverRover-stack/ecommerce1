// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// Display cart items
function displayCartItems() {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="py-8 text-center text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                <p class="text-xl">Your cart is empty</p>
                <a href="index.html" class="text-green-500 hover:underline mt-2 inline-block">
                    Continue Shopping
                </a>
            </div>
        `;
        cartTotalElement.textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'py-4 flex items-center';
        cartItem.innerHTML = `
            <div class="flex-shrink-0">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
            </div>
            <div class="ml-4 flex-1">
                <h3 class="font-medium">${item.name}</h3>
                <p class="text-gray-600">$${item.price.toFixed(2)}</p>
                <div class="mt-2 flex items-center">
                    <button onclick="updateQuantity(${item.id}, -1)" class="px-2 py-1 border rounded-l hover:bg-gray-100">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                        class="w-12 text-center border-t border-b py-1" 
                        onchange="updateQuantity(${item.id}, 0, this.value)">
                    <button onclick="updateQuantity(${item.id}, 1)" class="px-2 py-1 border rounded-r hover:bg-gray-100">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button onclick="removeItem(${item.id})" class="ml-4 text-red-500 hover:text-red-700">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="ml-4 font-medium">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    updateCartTotal();
}

// Update item quantity
function updateQuantity(id, change, newValue) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    if (newValue !== undefined) {
        item.quantity = parseInt(newValue) || 1;
    } else {
        item.quantity += change;
        if (item.quantity < 1) item.quantity = 1;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// Remove item from cart
function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Update cart (currently just refreshes display)
function updateCart() {
    displayCartItems();
    showToast('Cart updated');
}

// Proceed to checkout
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    window.location.href = 'checkout.html';
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
    displayCartItems();
});