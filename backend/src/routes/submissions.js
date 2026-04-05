const express = require('express');
const Submission = require('../models/Submission');
const Group = require('../models/Group');
const Assignment = require('../models/Assignment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/submissions
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { assignmentId, content, groupId } = req.body;

    if (!assignmentId || !content) {
      return res.status(400).json({ success: false, message: 'assignmentId and content are required' });
    }

    // Check for duplicate
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (existingSubmission) {
      return res.status(409).json({ success: false, message: 'You have already submitted for this assignment' });
    }

    const submissionData = {
      assignmentId,
      studentId: req.user._id,
      content,
      status: 'submitted',
    };

    if (groupId) {
      submissionData.groupId = groupId;
    }

    const submission = await Submission.create(submissionData);

    res.status(201).json({ success: true, submission });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already submitted for this assignment' });
    }
    console.error('Create submission error:', error);
    res.status(500).json({ success: false, message: 'Server error creating submission' });
  }
});

// PATCH /api/submissions/:id/acknowledge
router.patch('/:id/acknowledge', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (submission.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to acknowledge this submission' });
    }

    submission.acknowledged = true;
    submission.status = 'acknowledged';
    await submission.save();

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error('Acknowledge submission error:', error);
    res.status(500).json({ success: false, message: 'Server error acknowledging submission' });
  }
});

// PATCH /api/submissions/group-acknowledge
router.patch('/group-acknowledge', protect, authorize('student'), async (req, res) => {
  try {
    const { groupId, assignmentId } = req.body;

    if (!groupId || !assignmentId) {
      return res.status(400).json({ success: false, message: 'groupId and assignmentId are required' });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (req.user._id.toString() !== group.leaderId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the group leader can acknowledge submissions for the entire group' });
    }

    await Submission.updateMany(
      { groupId, assignmentId },
      { acknowledged: true, status: 'acknowledged' }
    );

    res.status(200).json({ success: true, message: 'All group submissions acknowledged' });
  } catch (error) {
    console.error('Group acknowledge error:', error);
    res.status(500).json({ success: false, message: 'Server error acknowledging group submissions' });
  }
});

// GET /api/submissions/my/all — all submissions for logged-in student across all courses
router.get('/my/all', protect, authorize('student'), async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate({
        path: 'assignmentId',
        select: 'title deadline courseId',
        populate: { path: 'courseId', select: 'title' },
      })
      .sort({ submittedAt: -1 });

    // Compute aggregate stats
    const total = submissions.length;
    const graded = submissions.filter((s) => s.grade != null);
    const avgGrade = graded.length > 0
      ? Math.round(graded.reduce((acc, s) => acc + s.grade, 0) / graded.length)
      : null;
    const statusCounts = { submitted: 0, acknowledged: 0, pending: 0 };
    submissions.forEach((s) => {
      if (statusCounts[s.status] !== undefined) statusCounts[s.status]++;
    });

    res.status(200).json({
      success: true,
      submissions,
      stats: { total, graded: graded.length, avgGrade, ...statusCounts },
    });
  } catch (error) {
    console.error('Get all submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
});

// GET /api/submissions/my/:assignmentId
router.get('/my/:assignmentId', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignmentId: req.params.assignmentId,
      studentId: req.user._id,
    }).populate('groupId', 'name leaderId');

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error('Get my submission error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submission' });
  }
});

// PATCH /api/submissions/:id/grade — professor only
router.patch('/:id/grade', protect, authorize('professor'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null || typeof grade !== 'number') {
      return res.status(400).json({ success: false, message: 'grade (number 0-100) is required' });
    }

    if (grade < 0 || grade > 100) {
      return res.status(400).json({ success: false, message: 'grade must be between 0 and 100' });
    }

    const submission = await Submission.findById(req.params.id).populate('assignmentId', 'courseId createdBy');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify the assignment belongs to a course taught by this professor
    const assignment = submission.assignmentId;
    if (!assignment || assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this submission' });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    submission.gradedAt = new Date();
    await submission.save();

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: 'Server error grading submission' });
  }
});

module.exports = router;