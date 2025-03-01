const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Link',
    required: true,
  },
  accessedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);