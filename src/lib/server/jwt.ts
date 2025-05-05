import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'devsecret';

export function signJwt(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyJwt(token: string) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}