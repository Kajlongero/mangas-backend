import boom from "@hapi/boom";

import { AccessTokenPayload } from "../auth/types/token.model";
import { prisma } from "../../../config/prisma";

export class UserService {
  async getUserData(data: AccessTokenPayload) {
    const user = await prisma.users.findUnique({
      where: {
        id: data.uid,
      },
      select: {
        id: true,
        auth: {
          select: {
            id: true,
          },
        },
        deletedAt: true,
      },
    });
    if (!user) return boom.notFound("User not found");
    if (user.deletedAt) throw boom.notFound("User has been deleted");

    const transaction = await prisma.$transaction(async (tx) => {
      const _profile = await tx.profile.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          username: true,
          description: true,
        },
      });
      if (!_profile) throw boom.notFound("User not found");

      const _authInfo = await tx.auth_info.findFirst({
        where: {
          authId: user.auth?.id,
        },
        select: {
          email: true,
        },
      });

      const _roles = await tx.roles.findMany({
        where: {
          auth: {
            some: {
              id: user.auth?.id,
            },
          },
        },
      });

      const _pfp = await prisma.images.findFirst({
        where: {
          profile_images: {
            profileId: _profile.id,
          },
        },
        select: {
          imagesStore: {
            select: {
              url: true,
            },
          },
          url: true,
        },
      });

      const _bg = await prisma.images.findFirst({
        where: {
          background_images: {
            profileId: _profile.id,
          },
        },
        select: {
          imagesStore: {
            select: {
              url: true,
            },
          },
          url: true,
        },
      });

      return {
        _authInfo,
        _profile,
        _roles,
        _pfp,
        _bg,
      };
    });

    return {
      id: data.uid,
      username: transaction._profile.username,
      description: transaction._profile.description,
      email: transaction._authInfo?.email,
      roles: transaction._roles?.map((r) => r.name),
      backgroundImage:
        transaction._bg && transaction._bg.imagesStore
          ? `${transaction._bg.imagesStore.url}${transaction._bg.url}`
          : null,
      profileImage:
        transaction._pfp && transaction._pfp?.imagesStore
          ? `${transaction._pfp.imagesStore.url}${transaction._pfp.url}`
          : null,
    };
  }

  async getUserById(id: string) {
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        deletedAt: true,
        auth: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user) throw boom.notFound("User not found");
    if (user.deletedAt) throw boom.notFound("User has been deleted");

    const transaction = await prisma.$transaction(async (tx) => {
      const _profile = await tx.profile.findFirst({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          username: true,
          description: true,
        },
      });
      if (!_profile) throw boom.notFound("User not found");

      const _roles = await tx.roles.findMany({
        where: {
          auth: {
            some: {
              id: user.auth?.id,
            },
          },
        },
      });

      const _pfp = await prisma.images.findFirst({
        where: {
          profile_images: {
            profileId: _profile.id,
          },
        },
        select: {
          imagesStore: {
            select: {
              url: true,
            },
          },
          url: true,
        },
      });

      const _bg = await prisma.images.findFirst({
        where: {
          background_images: {
            profileId: _profile.id,
          },
        },
        select: {
          imagesStore: {
            select: {
              url: true,
            },
          },
          url: true,
        },
      });

      return {
        _profile,
        _roles,
        _pfp,
        _bg,
      };
    });

    return {
      id: user.id,
      username: transaction._profile.username,
      description: transaction._profile.description,
      roles: transaction._roles?.map((r) => r.name),
      backgroundImage:
        transaction._bg && transaction._bg.imagesStore
          ? `${transaction._bg.imagesStore.url}${transaction._bg.url}`
          : null,
      profileImage:
        transaction._pfp && transaction._pfp?.imagesStore
          ? `${transaction._pfp.imagesStore.url}${transaction._pfp.url}`
          : null,
    };
  }
}
