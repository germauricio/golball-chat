const express = require('express');
const app = express();

app.use(function(req: any, res: any, next: any) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});

const httpServer = app.listen('8080');

const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*'
  }
});

const messages: any = [];

io.on("connection", async (socket: any) => {
  socket.on("newMessage", (args:any) => {
    messages.push(args);
    socket.emit("receivedMessage", messages);
  });
});
