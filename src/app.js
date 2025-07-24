import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(cors({
    origin : process.env.CORS_ORG,
    credentials : true
}))


app.use(express.json({limit : "16kb" }))
app.use(express.urlencoded({ extended : true, limit : "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())



// app.get('/api', (req, res) => {
//     res.send("hello");
// })
import router from './routes/user.route.js';

app.use('/api/v1/user', router);

export default app;