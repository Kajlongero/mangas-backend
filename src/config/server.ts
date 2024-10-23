import dotenv from "dotenv";

dotenv.config();

export const ServerConfig = {
  PORT: process.env.SERVER_PORT,
  JWT_SECRET: process.env.JWT_SECRET,
};
