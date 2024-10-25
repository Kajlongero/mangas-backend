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
import { isHigherDate } from "../shared/utils/is.higher.date";
import { CalculateLoginWaitTime } from "./utils/wait.time";

type RegisterInfo = {
  email: string;
  password: string;
  username: string;
};

export class AuthService {
  public async generateTokenPair(token: JwtPayload) {
    const jti = token.jti as string;
    const sid = token.sid as string;
    const authId = token.sub as string;

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

      return {
        _user,
        _session,
      };
    });

    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID();

    const atPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      sub: transaction?._user.auth?.id,
      uid: transaction?._user.id,
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
      roles: [
        transaction._user.auth?.roles.map((role) => role.name.toUpperCase()),
      ],
    };

    const rtPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: sid,
      sub: transaction?._user.auth?.id,
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
    };

    await prisma.$transaction(async (tx) => {
      await tx.blacklisted_sessions.create({
        data: {
          jti: jti as string,
          expiredAt: new Date().toISOString() as string,
          authSecurityId: transaction._user.auth?.authSecurity?.id as string,
          expired: true,
          wasLogout: false,
        },
      });

      await tx.active_sessions.update({
        where: {
          id: transaction._session.id,
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

  private async findEmail(email: string) {
    const user = await prisma.users.findFirst({
      where: {
        auth: {
          authInfo: {
            email: email,
          },
        },
      },
      select: {
        id: true,
        auth: {
          select: {
            id: true,
            roles: {
              select: {
                name: true,
              },
            },
            authSecurity: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  public async login(data: Omit<RegisterInfo, "username">) {
    const { email, password } = data;

    const exists = await prisma.auth.findFirst({
      where: {
        authInfo: {
          email,
        },
      },
      include: {
        authSecurity: true,
      },
    });
    if (!exists) throw boom.unauthorized("Invalid email or password");

    const d1 =
      exists.authSecurity?.timeToLogin &&
      exists.authSecurity?.timeToLogin.toISOString();

    const d2 = new Date().toISOString();

    if (d1 && isHigherDate(d1, d2))
      throw boom.unauthorized("You must wait until", d1, "to login again");

    if (d1 && !isHigherDate(d1, d2)) {
      const attempts = exists.authSecurity?.passwordChangeAttempts as number;

      await prisma.auth_security.update({
        where: {
          id: exists.id,
        },
        data: {
          loginAttempts: {
            increment: 1,
          },
          timeToLogin:
            attempts - 5 >= 0 ? CalculateLoginWaitTime(attempts) : null,
        },
      });

      throw boom.unauthorized("Invalid credentials");
    }

    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID();

    const transaction = await prisma.$transaction(async (tx) => {
      const _user = await prisma.users.findFirst({
        where: {
          auth: {
            id: exists.id,
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

      const _session = await tx.active_sessions.create({
        data: {
          jti: uuid1,
          validUntil: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 180
          ).toISOString(),
          authSecurity: {
            connect: {
              id: _user?.auth?.authSecurity?.id,
            },
          },
        },
      });

      await tx.auth_security.update({
        where: {
          id: _user?.auth?.authSecurity?.id,
        },
        data: {
          loginAttempts: 0,
          timeToLogin: null,
        },
      });

      return {
        _user,
        _session,
      };
    });

    const atPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      sub: transaction?._user?.auth?.id,
      uid: transaction?._user?.id,
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
      roles: [
        transaction._user?.auth?.roles.map((role) => role.name.toUpperCase()),
      ],
    };

    const rtPayload: JwtPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: transaction._session.id,
      sub: transaction?._user?.auth?.id,
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
    };

    const at = SignAccessToken(atPayload, {});
    const rt = SignRefreshToken(rtPayload, {});

    return {
      AccessToken: at,
      RefreshToken: rt,
    };
  }

  public async register(data: RegisterInfo) {
    const emailTaken = await this.findEmail(data.email);
    if (emailTaken) throw boom.conflict("Email already taken");

    const usernameTaken = await prisma.profile.findFirst({
      where: {
        username: data.username,
      },
    });
    if (usernameTaken) throw boom.conflict("Username already used");

    const uuid1 = crypto.randomUUID();
    const uuid2 = crypto.randomUUID();

    const transaction = await prisma.$transaction(async (tx) => {
      const _hash = await bcrypt.hash(data.username, 10);

      const _role = await tx.roles.findFirst({
        where: {
          name: "READER",
        },
      });

      const _user = await tx.users.create({
        data: {},
      });

      const _auth = await tx.auth.create({
        data: {
          user: {
            connect: {
              id: _user.id,
            },
          },
          roles: {
            connect: {
              id: _role?.id,
            },
          },
        },
      });

      const profile = await tx.profile.create({
        data: {
          username: data.username,
          profileImageId: 0,
          user: {
            connect: {
              id: _user.id,
            },
          },
        },
      });

      const _info = await tx.auth_info.create({
        data: {
          email: data.email,
          password: _hash,
          auth: {
            connect: {
              id: _auth.id,
            },
          },
        },
      });

      const _security = await tx.auth_security.create({
        data: {
          auth: {
            connect: {
              id: _auth.id,
            },
          },
        },
      });

      const _session = await tx.active_sessions.create({
        data: {
          jti: uuid1,
          validUntil: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 180
          ).toISOString(),
          authSecurity: {
            connect: {
              id: _security.id,
            },
          },
        },
      });
      return {
        _user,
        _auth,
        _role,
        _session,
      };
    });

    const atPayload: JwtPayload = {
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      sub: transaction._auth.id,
      uid: transaction._user.id,
      roles: [transaction._role?.name],
    };

    const rtPayload: JwtPayload = {
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: transaction._session.id,
      sub: transaction._auth.id,
    };

    const at = SignAccessToken(atPayload, {});
    const rt = SignRefreshToken(rtPayload, {});

    return {
      AccessToken: at,
      RefreshToken: rt,
    };
  }
}
