const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

    const newUser = new User({userName , email, password});
    await newUser.save();
    // 
    const token = jwt.sign({ id: newUser._id, email:newUser.email }, process.env.JWT_SECRET, {
       expiresIn: '1h',
     });
    res.status(201).json({ token , newUser});


  }catch(error){
    res.status(500).json({message:"Server error" , error: error.message});
  }

});


module.exports = router;