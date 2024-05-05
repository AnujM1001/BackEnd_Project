import { asyncHAndler } from "../utils/asayncHandler.js";
import { ApiError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/responseHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinatry } from "../utils/couldinary.service.js";

const generateAccessAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refershToken = await user.generateRefreshToken();
    user.refershToken = refershToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refershToken,
    };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens");
  }
};

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

const loginUser = asyncHAndler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or password required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "useruser does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "username or passwrod incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "login success"
      )
    );
});

const logOutUser = asyncHAndler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refershToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "Logged Out"));
});

export { registerUser, loginUser, logOutUser };
