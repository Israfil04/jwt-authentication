import userModel from "../models/user-model.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import MailService from "./mail-service.js";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";
import ApiError from "../exceptions/api-error.js";

class UserService {
  async registration(email, password) {
    try {
      const candidateUser = await userModel.findOne({ email });
      if (candidateUser) {
        throw ApiError.BadRequest("Пользователь с таким email уже существует");
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const activationLink = uuidv4();

      const user = await userModel.create({
        email,
        password: hashPassword,
        activationLink,
      });

      await MailService.sendActivateMail(
        email,
        `${process.env.API_URL}/api/activate/${activationLink}`
      );

      const userDto = new UserDto(user);
      const tokens = await tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);

      return {
        ...tokens,
        user: userDto,
      };
    } catch (error) {
      console.error("❌ Ошибка в UserService.registration:", error.message);
      throw error;
    }
  }

  async login(email, password) {
    const user = await userModel.findOne({ email });
    if (!user)
      throw ApiError.BadRequest("Пользователь с таким email не найден");

    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) throw ApiError.BadRequest("Неверный пороль");

    const userDto = new UserDto(user);
    const tokens = await tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }
  async refresh(refreshToken) {
    if (!refreshToken) throw ApiError.UnauthorizedError();
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromdb = await tokenService.findOneToken(refreshToken);
    if (!userData || !tokenFromdb) throw ApiError.UnauthorizedError();
    const user = await userModel.findById(userData.id)
    const userDto = new UserDto(user);
    const tokens = await tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }
  async getAllUsers() {
    const users = await userModel.find()
    return users
  }
}

export default new UserService();
