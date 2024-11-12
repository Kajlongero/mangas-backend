import { type Express, Router } from "express";
import { router as AuthRouter } from "../api/components/auth/route";
import { router as UserRouter } from "../api/components/user/route";

const router = Router();

export function ApiSplit(app: Express) {
  app.use("/api/v1", router);

  router.use("/auth", AuthRouter);
  router.use("/user", UserRouter);
}
