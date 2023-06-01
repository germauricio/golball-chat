const express = require('express');
const cors = require('cors');

const app = express();

const corsOrigin ={
  origin:'*', //or whatever port your frontend is using
  optionSuccessStatus:200
}

const httpServer = app.listen('8080');

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    credentials: false
  },
  // transports: ['websocket', 'polling']
});

app.use(cors(corsOrigin));

io.engine.on("initial_headers", (headers: any, req: any) => {
  headers["Access-Control-Allow-Origin"] = "*";
});

io.engine.on("headers", (headers: any, req: any) => {
  headers["Access-Control-Allow-Origin"] = "*"; // url to all
});

const messages: any = [];

io.on("connection", async (socket: any) => {
  console.log("connected bro!")
  socket.emit("newMessage", messages);

  socket.on("newMessage", (args:any) => {
    messages.push(args);
    socket.emit("newMessage", messages);
    socket.broadcast.emit("newMessage", messages);
  });
});
