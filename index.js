require('dotenv').config(); // Load environment variables from .env file
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoute');
const linkRoutes = require('./routes/linkRoutes.js');
const cookieParser = require('cookie-parser');


// **
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/link', linkRoutes);





// 
app.get('/',(req, res)=>{
    res.send("Sharelinks is running")
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});