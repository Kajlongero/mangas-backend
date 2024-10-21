import dotenv from "dotenv";

dotenv.config();

export const ServerConfig = {
  PORT: process.env.SERVER_PORT,
};
