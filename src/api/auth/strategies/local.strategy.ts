import { Strategy } from "passport-local";
import type {
  IStrategyOptionsWithRequest,
  VerifyFunctionWithRequest,
} from "passport-local";

const opts: IStrategyOptionsWithRequest = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};

const cb: VerifyFunctionWithRequest = (req, username, password, done) => {};

export const LocalStrategy = new Strategy(opts, cb);
