import { asyncHAndler } from "../utils/asayncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/responseHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinatry } from "../utils/couldinary.service.js";

const registerUser = asyncHAndler(async (req, res) => {
  const { fullName, userName, email, password } = req.body;
  console.log(fullName, userName, email, password);
  if (
    [fullName, userName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // write mmore validations
  const existedUser = await User.findOne({
    $or: [{ email }, { username: userName }],
  });

  if (existedUser) throw new ApiError(409, "User Already Exist");

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar is required");

  const avatar = await uploadOnCloudinatry(avatarLocalPath);
  const coverImage = await uploadOnCloudinatry(coverImageLocalPath);
  console.log(avatar);
  if (!avatar) throw new ApiError(400, "Avatar is required");

  const user = await User.create({
    fullname: fullName,
    avatar: avatar.url,
    email,
    username: userName,
    coverImage: coverImage?.url || "",
    password,
  });

  const savedUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  if (!savedUser) {
    throw new ApiError(500, "USer not saved in DB");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, savedUser, "Üser Regisstered"));
});

export { registerUser };
