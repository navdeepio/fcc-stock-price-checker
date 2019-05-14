const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  likes: [{
    type: String,
    unique: true,
  }],
});

module.exports = mongoose.model('Stock', stockSchema);
