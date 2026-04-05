const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/assignments/course/:courseId
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('courseId', 'title');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submissionStatus = null;
    if (req.user.role === 'student') {
      const submission = await Submission.findOne({
        assignmentId: req.params.id,
        studentId: req.user._id,
      });
      submissionStatus = submission;
    }

    res.status(200).json({ success: true, assignment, submissionStatus });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching assignment' });
  }
});

// POST /api/assignments
router.post('/', protect, authorize('professor'), async (req, res) => {
  try {
    const { title, description, deadline, submissionType, courseId } = req.body;

    if (!title || !description || !deadline || !courseId) {
      return res.status(400).json({ success: false, message: 'Title, description, deadline, and courseId are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.professorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to add assignments to this course' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      submissionType: submissionType || 'individual',
      courseId,
      createdBy: req.user._id,
    });

    await Course.findByIdAndUpdate(courseId, {
      $push: { assignmentIds: assignment._id },
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error creating assignment' });
  }
});

// PUT /api/assignments/:id
router.put('/:id', protect, authorize('professor'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assignment' });
    }

    const { title, description, deadline, submissionType } = req.body;

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline, submissionType },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, assignment: updatedAssignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error updating assignment' });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', protect, authorize('professor'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
    }

    await Course.findByIdAndUpdate(assignment.courseId, {
      $pull: { assignmentIds: assignment._id },
    });

    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting assignment' });
  }
});

// GET /api/assignments/:id/submissions
router.get('/:id/submissions', protect, authorize('professor'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const filter = { assignmentId: req.params.id };

    if (req.query.status && ['pending', 'submitted', 'acknowledged'].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const submissions = await Submission.find(filter)
      .populate('studentId', 'name email')
      .populate('groupId', 'name')
      .sort({ submittedAt: -1 });

    // Count by status
    const allSubmissions = await Submission.find({ assignmentId: req.params.id });
    const stats = {
      total: allSubmissions.length,
      submitted: allSubmissions.filter((s) => s.status === 'submitted').length,
      acknowledged: allSubmissions.filter((s) => s.status === 'acknowledged').length,
      pending: allSubmissions.filter((s) => s.status === 'pending').length,
    };

    res.status(200).json({ success: true, submissions, stats });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching submissions' });
  }
});

module.exports = router;