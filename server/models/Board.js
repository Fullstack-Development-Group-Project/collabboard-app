const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPersonal: {
      type: Boolean,
      default: false,
    },
    columns: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
    }],
  },
  {
    timestamps: true,
    collection: 'boards',
    strict: true,
  },
);

module.exports = mongoose.model('Board', boardSchema);
