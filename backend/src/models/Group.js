const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Leader ID is required'],
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);