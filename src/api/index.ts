import { type Express, Router } from "express";

const router = Router();

export function ApiSplit(app: Express) {
  app.use("/api/v1", router);
}
