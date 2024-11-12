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
import { AccessTokenPayload, RefreshTokenPayload } from "./types/token.model";
import { LoginModel, RegisterModel } from "./interfaces/auth.model";

export class AuthService {
  public async validateAccessToken(payload: AccessTokenPayload) {
    const userId = payload.uid;

    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });
    if (!user) throw boom.notFound("User not found");
    if (user.deletedAt) throw boom.notFound("User has been deleted");

    return true;
  }
  public async generateTokenPair(payload: RefreshTokenPayload) {
    const jti = payload.jti as string;
    const sid = payload.sid as string;
    const authId = Number(payload.sub);

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
      sub: `${transaction?._user.auth?.id}`,
      uid: transaction?._user.id,
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
      roles: [
        transaction._user.auth?.roles.map((role) => role.name.toUpperCase()),
      ],
    };

    const rtPayload: RefreshTokenPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: sid,
      sub: `${transaction?._user.auth?.id}`,
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
    };

    await prisma.$transaction(async (tx) => {
      await tx.blacklisted_sessions.create({
        data: {
          jti: jti as string,
          expiredAt: new Date().toISOString() as string,
          authSecurityId: transaction._user.auth?.authSecurity?.id as number,
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
  public async login(data: LoginModel) {
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
          profile: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!_user) throw boom.unauthorized("Invalid credentials");

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

    const atPayload: AccessTokenPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      sub: transaction?._user?.auth?.id.toString(),
      pid: transaction._user.profile?.id as number,
      uid: transaction?._user?.id as string,
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
      roles: transaction._user?.auth?.roles.map(
        (elem) => elem.name
      ) as string[],
    };

    const rtPayload: RefreshTokenPayload = {
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: transaction._session.id,
      sub: transaction?._user?.auth?.id.toString(),
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
  public async register(data: RegisterModel) {
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
      if (!_role) throw boom.badData("Role not found");

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

      const _profile = await tx.profile.create({
        data: {
          username: data.username,
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
        _profile,
        _auth,
        _role,
        _session,
      };
    });

    const atPayload: AccessTokenPayload = {
      jti: uuid2,
      aud: ["http://localhost:3001/api/v1"],
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 15,
      uid: transaction._user.id,
      sub: transaction._auth.id.toString(),
      pid: transaction._profile.id,
      roles: [transaction._role?.name],
    };

    const rtPayload: RefreshTokenPayload = {
      jti: uuid1,
      aud: ["http://localhost:3001/api/v1"],
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 180,
      sid: transaction._session.id,
      sub: transaction._auth.id.toString(),
    };

    const at = SignAccessToken(atPayload, {});
    const rt = SignRefreshToken(rtPayload, {});

    return {
      AccessToken: at,
      RefreshToken: rt,
    };
  }
}
