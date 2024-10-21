import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import http from "http";

import { ApiSplit } from "./api";
import { SocketSplitter } from "./socket";
import {
  BoomErrorHandler,
  InternalHandler,
  LogErrors,
} from "./api/middlewares/errors.handler";
import { ServerConfig } from "./config/server";

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

ApiSplit(app);
SocketSplitter(io);

app.use(LogErrors);
app.use(BoomErrorHandler);
app.use(InternalHandler);

httpServer.listen(ServerConfig.PORT, () =>
  console.log(`App running at port: ${ServerConfig.PORT}`)
);
