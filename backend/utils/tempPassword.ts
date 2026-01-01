export const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-8); // example: a9x3k2p1
};
