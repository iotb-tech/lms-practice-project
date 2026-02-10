import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateTokens = (payload) => {
 const accessToken = jwt.sign(
  payload,
  config.jwt.accessSecret,
  { expiresIn: config.jwt.accessExpiry }
 );

 const refreshToken = jwt.sign(
  payload,
  config.jwt.refreshSecret,
  { expiresIn: config.jwt.refreshExpiry }
 );

 return { accessToken, refreshToken };
};

export const verifyToken = (token, secret = config.jwt.accessSecret) => {
 return jwt.verify(token, secret);
};
