const express = require('express');
const cors = require('cors');
const Redis = require("ioredis");
const app = express();
const redisClient = new Redis();

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
  adapter: require("socket.io-redis")({
    pubClient: redisClient,
    subClient: redisClient.duplicate(),
  }),
  // transports: ['websocket', 'polling']
});

app.use(cors(corsOrigin));

io.engine.on("initial_headers", (headers: any, req: any) => {
  headers["Access-Control-Allow-Origin"] = "*";
});

io.engine.on("headers", (headers: any, req: any) => {
  headers["Access-Control-Allow-Origin"] = "*"; // url to all
});

const { RedisMessageStore } = require("./messageStore");
const messageStore = new RedisMessageStore(redisClient);

io.use((socket: any, next: any) => {
  const userID = socket.handshake.auth.userID;
  socket.userID = userID;
  socket.join(userID);

  next();
});

io.on("connection", async (socket: any) => {
  console.log("connected bro!")

  socket.on("oldMessages", async (args: any) => {
    const oldMessages = await messageStore.findMessagesForUser(socket.userID, args.chosenUserID);
    io.to(socket.userID).emit('oldMessages', oldMessages);
  });

  socket.on("newMessage", async (args:any) => {
    await messageStore.saveMessage({nickname: args.nickname, from: socket.userID, to: args.to, text: args.text});
    io.to(args.to.user_id).to(socket.userID.toString()).emit("newMessage", args);
  });
});
