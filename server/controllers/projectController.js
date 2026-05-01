// server/controllers/projectController.js
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Create project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { name, description, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide project name' });
    }

    const project = await Project.create({
      name,
      description,
      dueDate,
      owner: req.user.id,
      members: [
        {
          userId: req.user.id,
          role: 'Admin'
        }
      ]
    });

    await project.populate('owner', 'name email profilePicture');
    await project.populate('members.userId', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });

  } catch (err) {
    res.status(500).json({ message: 'Error creating project', error: err.message });
  }
};

// @desc    Get all user projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.userId': req.user.id }
      ]
    }).populate('owner', 'name email profilePicture')
      .populate('members.userId', 'name email profilePicture');

    res.json({
      success: true,
      count: projects.length,
      projects
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects', error: err.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('members.userId', 'name email profilePicture')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isMember = project.members.some(m => m.userId._id.toString() === req.user.id);
    const isOwner = project.owner._id.toString() === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json({
      success: true,
      project
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching project', error: err.message });
  }
};

// @desc    Update project
// @route   PATCH /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const adminMember = project.members.find(
      m => m.userId.toString() === req.user.id && m.role === 'Admin'
    );

    if (!adminMember && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admins can update project' });
    }

    const { name, description, dueDate, status } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;
    if (dueDate) project.dueDate = dueDate;
    if (status) project.status = status;

    await project.save();
    await project.populate('owner', 'name email profilePicture');
    await project.populate('members.userId', 'name email profilePicture');

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating project', error: err.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Owner only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only owner can delete
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete project' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting project', error: err.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin only)
exports.addMember = async (req, res) => {
  try {
    const { memberId, role } = req.body;

    if (!memberId) {
      return res.status(400).json({ message: 'Please provide member ID' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const adminMember = project.members.find(
      m => m.userId.toString() === req.user.id && m.role === 'Admin'
    );

    if (!adminMember && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Check if member already exists
    const alreadyMember = project.members.some(
      m => m.userId.toString() === memberId
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({
      userId: memberId,
      role: role || 'Member'
    });

    await project.save();
    await project.populate('members.userId', 'name email profilePicture');

    res.json({
      success: true,
      message: 'Member added successfully',
      project
    });

  } catch (err) {
    res.status(500).json({ message: 'Error adding member', error: err.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:memberId
// @access  Private (Admin only)
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const adminMember = project.members.find(
      m => m.userId.toString() === req.user.id && m.role === 'Admin'
    );

    if (!adminMember && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    project.members = project.members.filter(
      m => m.userId.toString() !== req.params.memberId
    );

    await project.save();
    await project.populate('members.userId', 'name email profilePicture');

    res.json({
      success: true,
      message: 'Member removed successfully',
      project
    });

  } catch (err) {
    res.status(500).json({ message: 'Error removing member', error: err.message });
  }
};