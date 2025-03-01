const mongoose = require('mongoose');

// 
const LinkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  accessType: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  password: {
    type: String,
  },
  expirationTime: {
    type: Date,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('Link', LinkSchema);