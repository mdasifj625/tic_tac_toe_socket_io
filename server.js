const gameSocket = require('./gameSocket');
const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  serveClient: false,
  cors: {
    origin: "*"
  }
});

// game socket 
gameSocket(io);

const PORT = process.argv[2];
server.listen(PORT, () => {
  console.log(`Server is listening at port ${PORT}...`);
});




