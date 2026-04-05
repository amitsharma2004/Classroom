const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate a unique 6-character alphanumeric course code
const generateCourseCode = async () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/1/0 to avoid confusion
  let code, exists;
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    exists = await Course.findOne({ courseCode: code });
  } while (exists);
  return code;
};

// GET /api/courses
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const courses = await Course.find({ studentIds: req.user._id })
        .populate('professorId', 'name email')
        .populate('assignmentIds', 'title deadline submissionType');

      return res.status(200).json({ success: true, courses });
    }

    if (req.user.role === 'professor') {
      const courses = await Course.find({ professorId: req.user._id })
        .populate('assignmentIds', 'title deadline submissionType');

      // For each course, get submission analytics
      const coursesWithAnalytics = await Promise.all(
        courses.map(async (course) => {
          const courseObj = course.toObject();

          // Count total students
          const studentCount = course.studentIds.length;
          courseObj.studentCount = studentCount;

          // Aggregate submission stats across all assignments in this course
          const assignmentIds = course.assignmentIds.map((a) => a._id);

          const submissionStats = await Submission.aggregate([
            { $match: { assignmentId: { $in: assignmentIds } } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ]);

          const stats = { pending: 0, submitted: 0, acknowledged: 0, total: 0 };
          submissionStats.forEach((s) => {
            stats[s._id] = s.count;
            stats.total += s.count;
          });
          courseObj.submissionStats = stats;

          return courseObj;
        })
      );

      return res.status(200).json({ success: true, courses: coursesWithAnalytics });
    }
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
});

// POST /api/courses
router.post('/', protect, authorize('professor'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }

    const courseCode = await generateCourseCode();
    const course = await Course.create({
      title,
      description,
      professorId: req.user._id,
      courseCode,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { taughtCourses: course._id },
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ success: false, message: 'Server error creating course' });
  }
});

// GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('professorId', 'name email')
      .populate('studentIds', 'name email')
      .populate('assignmentIds');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching course' });
  }
});

// POST /api/courses/enroll (by courseCode)
router.post('/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const { courseCode } = req.body;
    if (!courseCode) {
      return res.status(400).json({ success: false, message: 'Course code is required' });
    }

    const course = await Course.findOne({ courseCode: courseCode.trim().toUpperCase() });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Invalid course code. Please check with your professor.' });
    }

    const alreadyEnrolled = course.studentIds.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (alreadyEnrolled) {
      return res.status(409).json({ success: false, message: 'Already enrolled in this course' });
    }

    await Course.findByIdAndUpdate(course._id, { $push: { studentIds: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: course._id } });

    res.status(200).json({ success: true, message: `Successfully enrolled in "${course.title}"` });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: 'Server error enrolling in course' });
  }
});

// POST /api/courses/:id/enroll (legacy — by MongoDB _id)
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const alreadyEnrolled = course.studentIds.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(409).json({ success: false, message: 'Already enrolled in this course' });
    }

    await Course.findByIdAndUpdate(req.params.id, {
      $push: { studentIds: req.user._id },
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: course._id },
    });

    res.status(200).json({ success: true, message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: 'Server error enrolling in course' });
  }
});

module.exports = router;