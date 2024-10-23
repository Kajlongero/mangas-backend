import { ExtractJwt, Strategy } from "passport-jwt";
import type {
  StrategyOptionsWithoutRequest,
  VerifiedCallback,
  VerifyCallback,
} from "passport-jwt";

import { ServerConfig } from "../../../config/server";

const bearerOpts: StrategyOptionsWithoutRequest = {
  secretOrKey: ServerConfig.JWT_SECRET as string,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const bearerCb: VerifyCallback = <T>(payload: T, done: VerifiedCallback) => {};

const bodyOpts: StrategyOptionsWithoutRequest = {
  secretOrKey: ServerConfig.JWT_SECRET as string,
  jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
};

const bodyCb: VerifyCallback = <T>(payload: T, done: VerifiedCallback) => {};

export const JwtBearer = new Strategy(bearerOpts, bearerCb);
export const JwtBody = new Strategy(bodyOpts, bodyCb);
