import connectdb from "./db/index.js";
import dotenv from 'dotenv';


dotenv.config({
    path : './env'
})




console.log(process.env)

connectdb();