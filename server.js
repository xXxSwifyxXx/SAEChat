const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./chatDB.sqlite');

// Initialisation de la base de données
db.serialize(function () {
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});


// Nouvelle ligne pour servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    // Modifiez cette ligne pour envoyer le fichier index.html
    res.sendFile(__dirname + '/public/index.html');
});
app.get('/zub', (req, res) => {
    res.send('<h1>chibrax !</h1>');
});

io.on('connection', (socket) => {
    console.log('Un utilisateur s\'est connecté');

    // Envoyer l'historique des messages au nouvel utilisateur
    db.all("SELECT * FROM messages", [], (err, rows) => {
        if (err) throw err;
        socket.emit('load all messages', rows);
    });

    socket.on('message', (msg) => {
        // Stocker le message dans la base de données SQLite
        db.run("INSERT INTO messages (username, message) VALUES (?, ?)", [msg.username, msg.text]);

        // Envoie le message à tous les utilisateurs connectés
        io.emit('message', msg);
    });

    socket.on('load all messages', function (messages) {
        messages.forEach(function (message) {
            addMessageToDOM(message);
        });
    });


    socket.on('message', (msg) => {
        io.emit('message', msg); // Cela envoie le message à tous les utilisateurs connectés
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté');
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
