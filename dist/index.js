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
const app = express();
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
    // transports: ['websocket', 'polling']
});
app.use(cors(corsOrigin));
io.engine.on("initial_headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = "*";
});
io.engine.on("headers", (headers, req) => {
    headers["Access-Control-Allow-Origin"] = "*"; // url to all
});
const messages = [];
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    socket.emit("newMessage", messages);
    socket.on("newMessage", (args) => {
        messages.push(args);
        socket.broadcast.emit("newMessage", messages);
    });
}));
