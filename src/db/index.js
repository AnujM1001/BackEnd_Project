import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`mongodb+srv://Anuj:Anuj123@cluster0.5okvtrn.mongodb.net/${DB_NAME}`);
        if(connectionInstance) {
            console.log('\n MngoDB connected!! DB HOST', connectionInstance.connection.host);
        }
      } catch (error) {
        console.error("MONGODB connection error: ", error);
        process.exit(1);
      }
}

export default connectDB;