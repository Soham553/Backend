import connectdb from "./db/index.js";
import dotenv from 'dotenv';
import express from 'express'


dotenv.config({
    path : './env'
})

const app = express();




connectdb()
.then(() => {
    app.get('/', (req, res) => {
        console.log(process.env.PORT)
        res.send("hello world")
    })

    app.listen(process.env.PORT, () => {
        console.log(process.env.PORT)
    })

})
.catch((err) => {
    console.log(err)
})