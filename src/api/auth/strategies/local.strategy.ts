import { Strategy } from "passport-local";
import type {
  IStrategyOptionsWithRequest,
  VerifyFunctionWithRequest,
} from "passport-local";
import { AuthService } from "../../components/auth/service";
const instance = new AuthService();

const opts: IStrategyOptionsWithRequest = {
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true,
};

const cb: VerifyFunctionWithRequest = async (req, email, password, done) => {
  try {
    const login = await instance.login({ email, password });
    done(null, login);
  } catch (error) {
    done(error, false);
  }
};

export const LocalStrategy = new Strategy(opts, cb);
