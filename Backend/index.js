import express from 'express';
import './config/env.js'
import './config/mongo.js'
import userRouter from './routes/auth.js'
import formRouter from './routes/form.js'
import cors from 'cors'


const app = express();
const PORT = 8000;

app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', userRouter)
app.use('/api/forms', formRouter)


app.listen(PORT, ()=>{
    console.log("Server running on ", PORT)
})