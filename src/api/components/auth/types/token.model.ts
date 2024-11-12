import { JwtPayload } from "jsonwebtoken";

export type AccessTokenPayload = {
  uid: string;
  pid: number;
  roles: string[];
} & JwtPayload;

export type RefreshTokenPayload = {
  sid: string;
} & JwtPayload;
