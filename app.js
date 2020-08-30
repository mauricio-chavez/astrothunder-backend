const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const dialogflowSession = require('./dfSession');

io.on('connection', socket => {
  dialogflowSession(socket, io);
});

if (module === require.main) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}