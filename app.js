require ('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// middleware
app.use(express.json());

// Routes
app.use('/auth');
app.use('/links')

// connect to db
connectDB();


module.exports = app;