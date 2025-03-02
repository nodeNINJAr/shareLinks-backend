const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  uniqueID: { type: String, unique: true, required: true },
  content: { type: String }, // Can store text or file data (Base64)
  contentType: { type: String },
  filePath: { type: String }, // Optional: Store file path if saving files to disk
  accessType: { type: String, enum: ['public', 'private'], default: 'public' },
  password: { type: String },
  expirationTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  userId:{ type: String }
});

module.exports = mongoose.model('Link', LinkSchema);