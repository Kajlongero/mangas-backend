import joi from "joi";

const jwt = joi.string().alphanum();
const email = joi.string().email();
const password = joi.string().min(8).max(32);
const username = joi.string().min(3).max(64);

export const JwtSchema = joi.object({
  accessToken: jwt,
  refreshToken: jwt,
});

export const LoginSchema = joi.object({
  email: email.required(),
  password: password.required(),
});

export const RegisterSchema = joi.object({
  email: email.required(),
  password: password.required(),
  username: username.required(),
});
