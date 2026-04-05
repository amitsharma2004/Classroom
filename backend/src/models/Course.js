const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Short human-readable enrollment code (e.g. "AB12CD") shared by professor with students
    courseCode: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without courseCode during migrations
      uppercase: true,
      trim: true,
    },
    professorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Professor ID is required'],
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    assignmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);