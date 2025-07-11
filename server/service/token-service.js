import jwt from "jsonwebtoken";
import tokenModel from "../models/token-model.js";
class TokenService {
  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets are not defined in environment variables");
    }
  }
  async generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "20m",
      algorithm: "HS256",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
      algorithm: "HS256",
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (err) {
      return null;
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (err) {
      return null;
    }
  }
  async saveToken(userId, refreshToken) {
    try {
      const tokenData = await tokenModel.findOne({ user: userId });
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return await tokenData.save();
      } else {
        return await tokenModel.create({
          user: userId,
          refreshToken,
        });
      }
    } catch (error) {
      console.error("Error saving token", error);
      throw error;
    }
  }
  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }
   async findOneToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
