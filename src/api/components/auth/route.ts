import passport from "passport";
import { Router } from "express";

import { ValidateSchema } from "../../middlewares/joi.validator";
import { JwtSchema, LoginSchema, RegisterSchema } from "./model";

import { AuthService } from "./service";
import { JwtPayload } from "jsonwebtoken";
import { SuccessResponseBoth } from "../../responses/sucess.response";
import { RefreshTokenPayload } from "./types/token.model";

const instance = new AuthService();

const router = Router();

router.post(
  "/refresh-token",
  ValidateSchema(JwtSchema, "body"),
  passport.authenticate("jwt-body", { session: false }),
  async (req, res, next) => {
    try {
      const data = req.user;
      const tokenPair = await instance.generateTokenPair(
        data as RefreshTokenPayload
      );

      SuccessResponseBoth(req, res, tokenPair, "Success", 200);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  ValidateSchema(LoginSchema, "body"),
  passport.authenticate("local", { session: false }),
  async (req, res, next) => {
    try {
      const data = req.user;

      SuccessResponseBoth(req, res, data, "Login successfully", 200);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/register",
  ValidateSchema(RegisterSchema, "body"),
  async (req, res, next) => {
    try {
      const body = req.body;

      const tokenPair = await instance.register(body);

      SuccessResponseBoth(req, res, tokenPair, "Success", 200);
    } catch (error) {
      next(error);
    }
  }
);

export { router };
