const express = require('express');
const app = express();
const httpServer = app.listen('8080');

const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*',
  }
});

const messages: any = [];

io.on("connection", async (socket: any) => {

  socket.on("newMessage", (args:any) => {
    messages.push(args);
    socket.emit("receivedMessage", messages);
  });

});

