window.onload = function() {
    var form = document.getElementById('register-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.text())
            .then(data => {
                if (data === 'User successfully created') {
                    // Redirect to the login page
                    window.location.href = '/login.html';
                } else {
                    alert('Registration failed');
                }
            });
    });
};