import { badRequest } from "@hapi/boom";

import type { Schema } from "joi";
import type { Request, RequestHandler } from "express";

export const ValidateSchema =
  (schema: Schema, property: keyof Request): RequestHandler =>
  (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) next(badRequest(error));

    next();
  };
