import dotenv from "dotenv";

dotenv.config();

export const ServerConfig = {
  PORT: process.env.SERVER_PORT ?? 8000,
  JWT_SECRET: process.env.JWT_SECRET,
};
