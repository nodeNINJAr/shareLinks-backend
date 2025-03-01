const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMIddleware');
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
  }catch(error){
    res.status(500).json({message:"Server error" , error: error.message});
  }

});


    // ** Get the link
    // router.get('/:linkId', async (req, res) => {
    //   const { linkId } = req.params;
    //   // 
    //   try {
    //     // Find the link by ID
    //     const link = await Link.findById(linkId);
    //     if (!link) {
    //       return res.status(404).json({ message: 'Link not found' });
    //     }
    
    //     // Check if the link is private
    //     if (link.accessType === 'private') {
    //       // Check if the user is authenticated (e.g., via JWT)
    //       // if (!req.user || link.ownerId.toString() !== req.user.id) {
    //       //   return res.status(403).json({ message: 'Authentication required' });
    //       // }
    //     }
    
    //     // Return the link content
    //     res.status(200).json({ content: link.content });
    //   } catch (err) {
    //     res.status(500).json({ message: 'Server error', error: err.message });
    //   }
    // });
  
  // ** Update the link content
  // router.put('/:linkId', async (req, res) => {
  //     const { linkId } = req.params;
  //     const { content, accessType, password, expirationTime } = req.body;
    
  //     try {
  //       // Find the link by ID
  //       const link = await Link.findById(linkId);
  //       if (!link) {
  //         return res.status(404).json({ message: 'Link not found' });
  //       }
    
  //       // Check if the user is the owner of the link
  //       // if (link.ownerId.toString() !== req.user.id) {
  //       //   return res.status(403).json({ message: 'Unauthorized' });
  //       // }
    
  //       // Update the link
  //       link.content = content || link.content;
  //       link.accessType = accessType || link.accessType;
  //       link.password = password || link.password;
  //       link.expirationTime = expirationTime || link.expirationTime;
    
  //       await link.save();
  //       res.status(200).json({ message: 'Link updated', link });
  //     } catch (err) {
  //       res.status(500).json({ message: 'Server error', error: err.message });
  //     }
  //   });
  
   // ** Delete the link content
  
  // router.delete('/:linkId', async (req, res) => {
  //     const { linkId } = req.params;
    
  //     try {
  //       // Find the link by ID
  //       const link = await Link.findById(linkId);
  //       if (!link) {
  //         return res.status(404).json({ message: 'Link not found' });
  //       }
    
  //       // Check if the user is the owner of the link
  //       // if (link.ownerId.toString() !== req.user.id) {
  //       //   return res.status(403).json({ message: 'Unauthorized' });
  //       // }
    
  //       // Delete the link
  //       await Link.deleteOne({ _id: linkId });
  //       res.status(200).json({ message: 'Link deleted' });
  //     } catch (err) {
  //       res.status(500).json({ message: 'Server error', error: err.message });
  //     }
  //   });



// ** Sign in to jwt
router.post('/login', async(req, res)=> {
  const {uid, email,} = req?.body;
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
router.post('/logout',authMiddleware, async(req,res)=>{
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