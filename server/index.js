import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';
import router  from './router/Index.js';
import errorMiddleware from './middlewares/error-middleware.js';

const app = express();

const PORT = process.env.PORT || 8000;
const DB_URL = process.env.DB_URL

app.use(cors());
app.use(cookieParser());
app.use(express.json())
app.use('/api', router)
app.use(errorMiddleware)

const startServer = async () => {
  try {
   
    await mongoose.connect(DB_URL)
    mongoose.connection.on('error', (err) => {
      console.error('❌ Ошибка MongoDB:', err);
    });

    app.listen(PORT, () => {
      console.log(`Server started on Port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer()

