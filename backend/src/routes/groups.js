const express = require('express');
const Group = require('../models/Group');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/groups
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { assignmentId, name } = req.body;

    if (!assignmentId || !name) {
      return res.status(400).json({ success: false, message: 'assignmentId and name are required' });
    }

    const group = await Group.create({
      assignmentId,
      leaderId: req.user._id,
      memberIds: [req.user._id],
      name,
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ success: false, message: 'Server error creating group' });
  }
});

// POST /api/groups/:id/join
router.post('/:id/join', protect, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const alreadyMember = group.memberIds.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({ success: false, message: 'Already a member of this group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $push: { memberIds: req.user._id } },
      { new: true }
    ).populate('memberIds', 'name email').populate('leaderId', 'name email');

    res.status(200).json({ success: true, group: updatedGroup });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ success: false, message: 'Server error joining group' });
  }
});

// GET /api/groups/assignment/:assignmentId
router.get('/assignment/:assignmentId', protect, async (req, res) => {
  try {
    const groups = await Group.find({ assignmentId: req.params.assignmentId })
      .populate('leaderId', 'name email')
      .populate('memberIds', 'name email');

    res.status(200).json({ success: true, groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching groups' });
  }
});

// GET /api/groups/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leaderId', 'name email')
      .populate('memberIds', 'name email')
      .populate('assignmentId', 'title');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching group' });
  }
});

module.exports = router;