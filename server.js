const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.get('/', (request, response) => {
  response.json({message: 'Hello'})
})

app.use('/peerjs', peerServer);

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, name) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    io.to(roomId).emit('create-message', {name: 'Sistema', message:`${name} - Acabou de entrar`})
    socket.on('message', ({name, message}) => {
      socket.to(roomId).broadcast.emit('create-message', {name, message})
    });

    socket.on('hand-up', ({userId, isHandUp}) => {

      if(isHandUp){
        io.to(roomId).emit('create-message', {name: 'Sistema', message:`${name} - Levantou a mão`})
      }else {
        io.to(roomId).emit('create-message', {name: 'Sistema', message:`${name} - Abaixou a mão`})
      }
      
      socket.to(roomId).broadcast.emit('toggle-hand-up', {userId: `${userId}`, isHandUp})
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      io.to(roomId).emit('create-message', {name:'Sistema', message: `${name} - Saiu da sala`})
    })
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {console.log(`Listening in port: ${PORT}`)})