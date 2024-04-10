// Include necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize express and create a server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Define root route
app.get('/', (req, res) => {
  res.send('<h1>Bienvenue sur mon chat !</h1>');
});

// Handle Socket.IO events
io.on('connection', (socket) => {
  console.log('Un utilisateur s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Un utilisateur s\'est déconnecté');
  });

  socket.on('message', (msg) => {
    // Broadcast message to all clients
    io.emit('message', msg);
  });
});

// Listen on specified PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});