import passport from "passport";
import { Router } from "express";

import { UserService } from "./service";
import { AccessTokenPayload } from "../auth/types/token.model";
import { SuccessResponseBoth } from "../../responses/sucess.response";
const instance = new UserService();

const router = Router();

router.get(
  "/user-info",
  passport.authenticate("jwt-bearer", { session: false }),
  async (req, res, next) => {
    try {
      const userData = req.user;
      const userInfo = await instance.getUserData(
        userData as AccessTokenPayload
      );

      SuccessResponseBoth(req, res, userInfo, "Success", 200);
    } catch (error) {
      next(error);
    }
  }
);
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const findUser = await instance.getUserById(id);

    SuccessResponseBoth(req, res, findUser, "Success", 200);
  } catch (error) {
    next(error);
  }
});

export { router };
