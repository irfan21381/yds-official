// utils/jwt.ts
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";
const EXPIRES_IN = "7d";

// -------------------------
// Generate Token
// -------------------------
export const generateToken = (
  id: string,
  role: string,
  collegeId?: string
): string => {
  const payload: JwtPayload = {
    id,
    role,
    collegeId,
  };

  const options: SignOptions = {
    expiresIn: EXPIRES_IN,
  };

  return jwt.sign(payload, JWT_SECRET as string, options);
};

// -------------------------
// Verify Token
// -------------------------
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
};
