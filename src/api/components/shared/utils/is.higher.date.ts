export const isHigherDate = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1).toISOString();
  const d2 = new Date(date2).toISOString();

  if (d1 > d2) return true;

  return false;
};
