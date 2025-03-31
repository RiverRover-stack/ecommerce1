document.addEventListener('DOMContentLoaded', () => {
    // Handle signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: user.name,
                        email: user.email,
                        password: user.password
                    })
                });

                const result = await response.json();
                if (response.ok) {
                    showToast('Account created successfully!', true);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    showToast(result.error || 'Signup failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('An error occurred. Please try again.');
            }
        });
    }
});

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