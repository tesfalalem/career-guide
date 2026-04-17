<!DOCTYPE html>
<html>
<head>
    <title>Test Analytics API</title>
</head>
<body>
    <h1>Test Analytics API</h1>
    <div id="result"></div>
    
    <script>
        // First login
        fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mearegteame9995555@gmail.com', // Teacher from database
                password: 'password123'
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.token) {
                document.getElementById('result').innerHTML = '<p>✓ Logged in successfully</p>';
                
                // Now test analytics
                return fetch('http://localhost:8000/api/teacher/analytics', {
                    headers: {
                        'Authorization': 'Bearer ' + data.token,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                throw new Error('Login failed: ' + JSON.stringify(data));
            }
        })
        .then(r => {
            document.getElementById('result').innerHTML += '<p>HTTP Status: ' + r.status + '</p>';
            return r.text();
        })
        .then(text => {
            document.getElementById('result').innerHTML += '<h3>Response:</h3><pre>' + text + '</pre>';
            
            try {
                const json = JSON.parse(text);
                document.getElementById('result').innerHTML += '<p style="color: green;">✓ Valid JSON response!</p>';
            } catch (e) {
                document.getElementById('result').innerHTML += '<p style="color: red;">✗ Invalid JSON - this is the error!</p>';
            }
        })
        .catch(err => {
            document.getElementById('result').innerHTML += '<p style="color: red;">Error: ' + err.message + '</p>';
        });
    </script>
</body>
</html>
