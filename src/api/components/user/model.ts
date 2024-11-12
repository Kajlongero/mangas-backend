import joi from "joi";

const id = joi.string().uuid();

export const getUserSchema = joi.object({
  id: id.required(),
});
