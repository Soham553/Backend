import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectdb = async () => {
    try {

        const connect = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(connect.connection.host);
        
    } catch (error) {
        console.log(process.env.MONGODB_URL);
        console.log("An error Occure while connecting to database : ", error);
    }
}

export default connectdb;