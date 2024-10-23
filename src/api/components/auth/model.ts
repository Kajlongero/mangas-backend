import joi from "joi";

const jwt = joi.string().alphanum();

export const JwtSchema = joi.object({
  accessToken: jwt,
  refreshToken: jwt,
});
