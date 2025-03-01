const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Link = require('../models/Link');

const router = express.Router();

// ** Configure Multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Generate a shareable link with text or file data
router.post('/generate', upload.single('file'), async (req, res) => {
  // 
  const { text, accessType, password, expirationTime } = req.body;
  const file = req.file;

  if (!text && !file) {
    return res.status(400).json({ message: 'Either text or file is required' });
  }
  //  
  const uniqueID = uuidv4();
  // 
  try {
    let content;
    let contentType;
    if (file) {
      // If a file is uploaded, convert it to a Base64 string
      content = file.buffer.toString('base64');
      contentType = file.mimetype; // e.g., 'image/png', 'application/pdf'
    } else {
      // If text is provided, use it as the content
      content = Buffer.from(text, 'utf8').toString('base64'); // Encode text as Base64
      contentType = 'text/plain; charset=utf-8';
    }

    const newLink = new Link({
      uniqueID,
      content,
      contentType,
      accessType,
      password,
      expirationTime,
    });

    await newLink.save();
    res.status(201).json({ linkId: newLink.uniqueID, shareableLink: `http://localhost:5000/link/${newLink.uniqueID}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;