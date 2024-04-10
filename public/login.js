window.onload = function() {
    var form = document.getElementById('login-form');
    var registerButton = document.getElementById('register-button');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.text())
            .then(data => {
                if (data === 'Connexion réussie') {
                    // Redirect to the chat page
                    window.location.href = '/index.html';
                } else {
                    alert('Login failed');
                }
            });
    });

    registerButton.addEventListener('click', function(e) {
        // Redirect to the registration page
        window.location.href = '/register.html';
    });
};