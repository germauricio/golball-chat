"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const cors = require('cors');
const Redis = require("ioredis");
const app = express();
const redisClient = new Redis();
const corsOrigin = {
    origin: '*',
    optionSuccessStatus: 200
};
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
io.engine.on("initial_headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = "*";
});
io.engine.on("headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = "*"; // url to all
});
const { RedisMessageStore } = require("./messageStore");
const messageStore = new RedisMessageStore(redisClient);
io.use((socket, next) => {
    const userID = socket.handshake.auth.userID;
    socket.userID = userID;
    socket.join(userID);
    next();
});
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("connected bro!");
    socket.on("oldMessages", (args) => __awaiter(void 0, void 0, void 0, function* () {
        const oldMessages = yield messageStore.findMessagesForUser(socket.userID, args.chosenUserID);
        io.to(socket.userID).emit('oldMessages', oldMessages);
    }));
    socket.on("newMessage", (args) => __awaiter(void 0, void 0, void 0, function* () {
        yield messageStore.saveMessage({ nickname: args.nickname, from: socket.userID, to: args.to, text: args.text });
        io.to(args.to.user_id).to(socket.userID.toString()).emit("newMessage", args);
    }));
}));
