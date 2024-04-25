// require('dotenv').config()
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("app crashed", app);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server started to listen at:", process.env.PORT || 8000);
    });
  })
  .catch((err) => {
    console.log("MONGODB connection fail", err);
  });
