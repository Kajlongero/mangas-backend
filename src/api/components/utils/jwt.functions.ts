import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { ServerConfig } from "../../../config/server";

export const SignAccessToken = <T>(payload: T, opts: SignOptions): string => {
  return jwt.sign(
    payload as Record<string, string>,
    ServerConfig.JWT_SECRET as string,
    opts
  );
};

export const SignRefreshToken = <T>(payload: T, opts: SignOptions) => {
  return jwt.sign(
    payload as Record<string, string>,
    ServerConfig.JWT_SECRET as string,
    opts
  );
};

export const DecodeToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
