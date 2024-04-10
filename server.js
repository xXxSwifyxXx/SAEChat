const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse the body of POST requests as JSON
app.use(bodyParser.json());

// Connect to the SQLite database
const db = new sqlite3.Database('./chatDB.sqlite', (err) => {
    if (err) {
        console.error('Error connecting to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run("CREATE TABLE IF NOT EXISTS User (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)");
        db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    }
});

// User registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, function(err, hash) {
        if (err) {
            console.error('Error hashing password', err);
            return res.status(500).send('Error creating user');
        }

        db.run("INSERT INTO User (username, password) VALUES (?, ?)", [username, hash], function(err) {
            if (err) {
                console.error('Error inserting user', err.message);
                return res.status(500).send('Error creating user');
            }
            res.send('User successfully created');
        });
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM User WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            return res.status(400).send('User not found');
        }

        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                res.send('Successful login');
            } else {
                res.status(400).send('Incorrect password');
            }
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, function(err, hash) {
        if (err) {
            console.error('Error hashing password', err);
            return res.status(500).send('Error creating user');
        }

        db.run("INSERT INTO User (username, password) VALUES (?, ?)", [username, hash], function(err) {
            if (err) {
                console.error('Error inserting user', err.message);
                return res.status(500).send('Error creating user');
            }
            res.send('User successfully created');
        });
    });
});

app.get('/register.html', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use('/index.html', express.static(path.join(__dirname, 'public', 'index.html')));
app.use('/css/styles.css', express.static(path.join(__dirname, 'public', 'css', 'styles.css')));
app.use('/login.js', express.static(path.join(__dirname, 'public', 'login.js')));
app.use('/socket.io/socket.io.js', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist', 'socket.io.js')));

io.on('connection', (socket) => {
    console.log('A user has connected');

    // Send message history to the new user
    db.all("SELECT * FROM messages", [], (err, rows) => {
        if (err) {
            console.error('Error retrieving messages', err.message);
        } else {
            // Make sure to send objects with `username` and `message`
            socket.emit('load all messages', rows.map(row => {
                return { username: row.username, message: row.message };
            }));
        }
    });

    socket.on('message', (msg) => {
        console.log(msg + " has been received");
        db.run("INSERT INTO messages (username, message) VALUES (?, ?)", [msg.username, msg.message], function(err) {
            console.log(msg + " has been inserted");
            if (err) {
                console.error('Error inserting message', err.message);
            } else {
                // Send the message back to the client for display, include the sender
                io.emit('message', msg);
            }
            console.log(msg + " has been displayed" );
        });
    });

    socket.on('disconnect', () => {
        console.log('A user has disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});