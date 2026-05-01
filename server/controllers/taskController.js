// server/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, priority, dueDate } = req.body;

    if (!title || !projectId || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user is member of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'You are not member of this project' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user.id,
      priority: priority || 'Medium',
      dueDate
    });

    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email');

    // Add task to project
    project.tasks.push(task._id);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;

    let filter = {};

    // Only get tasks from projects user is member of
    const projects = await Project.find({
      $or: [
        { owner: req.user.id },
        { 'members.userId': req.user.id }
      ]
    }).select('_id');

    const projectIds = projects.map(p => p._id);
    filter.project = { $in: projectIds };

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('comments.userId', 'name profilePicture')
      .populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.userId.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    res.json({
      success: true,
      task
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};

// @desc    Update task
// @route   PATCH /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization
    const project = await Project.findById(task.project);
    const isMember = project.members.some(m => m.userId.toString() === req.user.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isAssigned = task.assignedTo.toString() === req.user.id;

    if (!isMember && !isOwner && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (status) {
      task.status = status;
      if (status === 'Completed') {
        task.completedAt = new Date();
      }
    }
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check authorization (only creator or project admin)
    const project = await Project.findById(task.project);
    const isAdmin = project.members.some(
      m => m.userId.toString() === req.user.id && m.role === 'Admin'
    );
    const isCreator = task.createdBy.toString() === req.user.id;
    const isProjectOwner = project.owner.toString() === req.user.id;

    if (!isAdmin && !isCreator && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Remove task from project
    project.tasks = project.tasks.filter(t => t.toString() !== req.params.id);
    await project.save();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide comment text' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.comments.push({
      userId: req.user.id,
      text
    });

    await task.save();
    await task.populate('comments.userId', 'name profilePicture');

    res.json({
      success: true,
      message: 'Comment added successfully',
      comments: task.comments
    });

  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};