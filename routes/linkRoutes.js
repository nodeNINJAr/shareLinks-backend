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


// ** Get the link content
router.get('/:linkId', async (req, res) => {
  const { linkId } = req.params;
  const { password } = req.query; 

  try {
    // Find the link by uniqueID
    const link = await Link.findOne({ uniqueID: linkId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // Check if the link has expired
    if (link.expirationTime && new Date() > link.expirationTime) {
      return res.status(410).json({ message: 'Link has expired' });
    }

    // Check if the link is private
    if (link.accessType === 'private') {
      if (!password) {
        return res.status(401).json({ message: 'Password is required' });
      }
      if (password !== link.password) {
        return res.status(403).json({ message: 'Incorrect password' });
      }
    }

    // ** Decode the Base64 content
    const contentBuffer = Buffer.from(link.content, 'base64');

    // Set the Content-Type header based on the stored contentType
    res.setHeader('Content-Type', link.contentType);

    // Serve the content directly
    if (link.contentType.startsWith('image')) {
      // If the content is an image, serve it as an image
      res.send(contentBuffer);
    } else if (link.contentType.startsWith('text/plain')) {
      // If the content is text, serve it as plain text
      res.send(contentBuffer.toString('utf8')); // Decode as UTF-8
    } else {
      // For other file types (e.g., PDF, DOCS), serve as a downloadable file
      res.setHeader('Content-Disposition', `attachment; filename="file.${link.contentType.split('/')[1]}"`);
      res.send(contentBuffer);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;