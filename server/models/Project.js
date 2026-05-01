// server/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Paused'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Populate owner and members before sending
// projectSchema.pre(/^find/, function(next) {
//   if (this.options._recursed) {
//     return next();
//   }
//   this.populate('owner', 'name email profilePicture');
//   this.populate('members.userId', 'name email profilePicture');
//   next();
// });
projectSchema.pre(/^find/, function () {
  if (this.options._recursed) return;

  this.populate('owner', 'name email profilePicture');
  this.populate('members.userId', 'name email profilePicture');
});

module.exports = mongoose.model('Project', projectSchema);