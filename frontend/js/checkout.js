// Get cart from localStorage
const cart = JSON.parse(localStorage.getItem('cart')) || [];
const orderItemsContainer = document.getElementById('order-items');
const subtotalElement = document.getElementById('subtotal');
const orderTotalElement = document.getElementById('order-total');
const checkoutForm = document.getElementById('checkout-form');

// Display order items
function displayOrderItems() {
    orderItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = `
            <div class="py-4 text-center text-gray-500">
                Your cart is empty
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'py-4 flex justify-between';
        orderItem.innerHTML = `
            <div class="flex items-center">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded mr-4">
                <div>
                    <h3 class="font-medium">${item.name}</h3>
                    <p class="text-gray-600">${item.quantity} × $${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="font-medium">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });

    updateOrderTotals();
}

// Update order totals
function updateOrderTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 5.00;
    const total = subtotal + shipping;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    orderTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Process payment
async function processPayment() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    if (!checkoutForm.checkValidity()) {
        showToast('Please fill all required fields');
        return;
    }

    const customer = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value
    };

    try {
        // Send order to server
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items: cart,
                customer: customer
            })
        });

        if (!response.ok) throw new Error('Payment failed');

        const result = await response.json();
        
        // Clear cart on success
        localStorage.removeItem('cart');
        
        // Show success message
        showToast('Order placed successfully!', true);
        
        // Redirect to home after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        showToast('Payment failed. Please try again.');
        console.error('Payment error:', error);
    }
}

// Show toast notification
function showToast(message, isSuccess = false) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
        isSuccess ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayOrderItems();
    
    // Toggle credit card fields based on payment method
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.getElementById('credit-card-fields').style.display = 
                e.target.value === 'credit' ? 'block' : 'none';
        });
    });
});