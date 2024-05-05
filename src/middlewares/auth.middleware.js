import { asyncHAndler } from "../utils/asayncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHAndler(async (res, req, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Äuthorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message);
  }
});
