import boom from "@hapi/boom";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Jwt, JwtPayload } from "jsonwebtoken";

import { prisma } from "../../../config/prisma";
import { ServerConfig } from "../../../config/server";
import {
  DecodeToken,
  SignAccessToken,
  SignRefreshToken,
} from "../utils/jwt.functions";

export class AuthController {
  public async generateTokenPair(token: JwtPayload) {
    const jti = token.jti as string;
    const sid = token.sid as string;
    const authId = token.sub as string;

    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID();

    const transaction = await prisma.$transaction(async (tx) => {
      const blacklisted = await prisma.blacklisted_sessions.findFirst({
        where: {
          jti: jti,
        },
      });
      if (blacklisted)
        throw boom.forbidden("Token expired, please log in again");

      const _user = await tx.users.findFirst({
        where: {
          auth: {
            id: authId,
          },
        },
        select: {
          id: true,
          auth: {
            select: {
              id: true,
              authSecurity: {
                select: {
                  id: true,
                },
              },
              roles: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      if (!_user) throw boom.unauthorized("User does not exists");

      const _session = await tx.active_sessions.findFirst({
        where: {
          id: sid,
        },
      });
      if (!_session) throw boom.forbidden("Invalid session token");

      return _user;
    });

    const atPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      sub: transaction?.auth?.id,
      uid: transaction?.id,
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
      roles: [transaction.auth?.roles.map((role) => role.name.toUpperCase())],
    };

    const rtPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: sid,
      sub: transaction?.auth?.id,
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
    };

    await prisma.$transaction(async (tx) => {
      await tx.blacklisted_sessions.create({
        data: {
          jti: jti as string,
          expiredAt: new Date().toISOString() as string,
          authSecurityId: transaction.auth?.authSecurity?.id as string,
          expired: true,
          wasLogout: false,
        },
      });

      await tx.active_sessions.update({
        where: {
          id: sid,
        },
        data: {
          jti: uuid2,
          validUntil: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 180
          ).toISOString(),
        },
      });
    });

    const at = SignAccessToken(atPayload, {});
    const rt = SignRefreshToken(rtPayload, {});

    return {
      AccessToken: at,
      RefreshToken: rt,
    };
  }
}
