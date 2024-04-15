import { asyncHAndler } from "../utils/asayncHandler.js";

const registerUser = asyncHAndler(async (req, res) => {
  res.status(200).json({
    message: "user registered",
  });
});

export { registerUser };
