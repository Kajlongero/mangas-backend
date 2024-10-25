import boom from "@hapi/boom";

export const CalculateLoginWaitTime = (attempts: number) => {
  const int = Number.isInteger(attempts);

  if (!int) throw boom.badData("Attempts must be a integer value");

  return new Date(1000 * 60 * 60 * Math.pow(attempts + 1, 2)).toISOString();
};
