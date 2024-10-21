import type { DefaultEventsMap, Server } from "socket.io";

type SocketInstance = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export const SocketSplitter = (io: SocketInstance) => {};
