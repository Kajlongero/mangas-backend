import { Router } from "express";
import { ValidateSchema } from "../../middlewares/joi.validator";
import { JwtSchema } from "./model";

import passport from "passport";

const router = Router();

router.post(
  "/refresh-token",
  passport.authenticate("jwt-body", { session: false }),
  async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  }
);
