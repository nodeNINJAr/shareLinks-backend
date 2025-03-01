const express = require('express');
const Link = require('../models/Link');

const router = express.Router();


// **
router.post('/new', async (req, res) => {
    const { content, accessType, password, expirationTime } = req.body;
    // const ownerId = req.user.id;
    // 
    try {
      const newLink = new Link({ content, accessType, password, expirationTime, ownerId:null });
      await newLink.save();
      res.status(201).json({ linkId: newLink._id });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });



module.exports = router;