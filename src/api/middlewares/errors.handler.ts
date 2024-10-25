import { type ErrorRequestHandler } from "express";

export const LogErrors: ErrorRequestHandler = (err, req, res, next) => {
  next(err);
};

export const BoomErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.isBoom) {
    const { output } = err;
    res.status(output.statusCode).json(output.payload);
  } else {
    next(err);
  }
};

export const InternalHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).json({
    message: "Internal Server error",
    statusCode: 500,
  });
};
