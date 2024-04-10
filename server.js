const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

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

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });

  socket.on('message', (msg) => {
    io.emit('message', msg); // Cela envoie le message à tous les utilisateurs connectés
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
