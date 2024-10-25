import { type Request, type Response } from "express";

export const SuccessResponseBoth = <T>(
  req: Request,
  res: Response,
  data: T,
  message: string = "",
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    error: false,
    data: data,
    message,
    statusCode,
  });
};
