const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const Link = require('../models/Link');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// ** Configure Multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Generate a shareable link with text or file data
router.post('/generate', upload.single('file'), async (req, res) => {
  // 
  const { text, accessType, password, expirationTime,userId } = req.body;
  const file = req.file;
  console.log(file);

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
      userId,
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
  //  
  try {
    // Find the link by uniqueID
    const link = await Link.findOne({ uniqueID: linkId });
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    
 console.log(link.expirationTime && new Date() > link.expirationTime);

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

    res.setHeader('Content-Type', link.contentType);

    // Serve the content directly
    if (link.contentType.startsWith('image')) {
      // If the content is an image, serve it as an image
      res.send(contentBuffer);
    } else if (link.contentType.startsWith('text/plain')) {
      // If the content is text, serve it as plain text
      res.send(contentBuffer.toString('utf8'));
    } else {
      // For other file types (e.g., PDF, DOCS), serve as a downloadable file
      res.setHeader('Content-Disposition', `attachment; filename="file.${link.contentType.split('/')[1]}"`);
      res.send(contentBuffer);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ** Get the link
router.get('/person/:uid', async (req, res) => {
  const { uid } = req.params;
  // 
  try {
    // Find the links by userId
    const links = await Link.find({ userId: uid }).sort({ createdAt: -1 });

    // Check if no links were found
    if (links.length === 0) {
      return res.status(404).json({ message: 'No links found for this user' });
    }
    // 
    const convertedLinks = links.map(link => {
      let contentString = '';
      // 
      if (link.content) {
        contentString = Buffer.from(link.content, "base64").toString("utf8");
      }
      //  
      return { ...link.toObject(), content: contentString };
    });
    // Return the found links
    res.status(200).json(convertedLinks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
    
// ** Delete the link content
router.delete('/:linkId', async (req, res) => {
    const { linkId } = req.params;
    // 
    try {
      // Find the link by ID
      const link = await Link.findById(linkId);
      if (!link) {
        return res.status(404).json({ message: 'Link not found' });
      }
  
      // Delete the link
      await Link.deleteOne({ _id: linkId });
      res.status(200).json({ message: 'Link deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

// ** Update the link content
router.patch('/:linkId/update', upload.single('file'), async (req, res) => {
    const { linkId } = req.params;
    const { textContent, accessType, password, expirationTime } = req.body;
    const file = req.file;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
    return res.status(400).json({ message: 'Invalid Link ID' });
    }
    // 
    try {
     const existingLink = await Link.findById(linkId);

      if (!existingLink) {
        return res.status(404).json({ message: 'Link not found' });
      }

    let content
    let contentType

    if (file) {
      content = file.buffer.toString('base64');
      contentType = file.mimetype;
    } else {
      content = Buffer.from(textContent, 'utf8').toString('base64');
      contentType = 'text/plain; charset=utf-8';
    }

    // Update the link
    existingLink.content = content ;
    existingLink.contentType = contentType ;
    existingLink.accessType = accessType ;
    existingLink.password = password ;
    existingLink.expirationTime = expirationTime;

    await existingLink.save();
    res.status(200).json({ message: "Linked Content Updated" });

    } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
    }
});
  

module.exports = router;