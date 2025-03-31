// Password Reset Functionality

// Handle forgot password form submission
document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
        
        const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send reset link');
        
        alert('If an account exists with this email, a reset link has been sent');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
        console.error('Password reset error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Reset Link';
    }
});

// Handle reset password form submission
document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('token');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Processing...';
        
        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to reset password');
        
        alert('Password reset successfully! Please login with your new password');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
        console.error('Password reset error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Reset Password';
    }
});

// Auto-fill token from URL if present
document.addEventListener('DOMContentLoaded', () => {
    const token = new URLSearchParams(window.location.search).get('token');
    const tokenField = document.getElementById('resetToken');
    if (token && tokenField) tokenField.value = token;
});