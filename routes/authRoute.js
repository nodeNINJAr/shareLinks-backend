const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { userName, email, password } = req.body;
  //   
  try{
    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(409).json({message:"User already exists"})
    }

    // Hash the PIN
    const hashedPass = await bcrypt.hash(password.toString(), 10);
    // 
    const newUser = new User({userName , email, password:hashedPass, isLogin:true});
    await newUser.save();
    // 
  }catch(error){
    res.status(500).json({message:"Server error" , error: error.message});
  }

});


// ** Sign in to jwt
router.post('/login', async(req, res)=> {
  const {uid, email} = req?.body;
  // 
  const token = jwt.sign({userId:uid, email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  
  // Set the token to cookkie
   res.cookie('token',token,{
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict', 
   })
  //  
  res.status(201).json({ token});
})


// ** Token remove from the cookie
router.post('/logout', async(req,res)=>{
  try {
     // Clear the token cookie
     res.clearCookie('token', {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'strict',
     });
 
     res.status(200).json({ message: 'Logout successful' });
   } catch (err) {
     console.error('Error during logout:', err);
     res.status(500).json({ message: 'Server error during logout' });
   }
})


module.exports = router;