// client/src/pages/ProjectDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: ''
  });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        axios.get(`/projects/${id}`),
        axios.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
    } catch (err) {
      console.error('Error fetching project:', err);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/tasks', {
        ...taskForm,
        projectId: id
      });
      setTasks([...tasks, data.task]);
      setShowTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const { data } = await axios.patch(`/tasks/${taskId}`, {
        status: newStatus
      });
      setTasks(tasks.map(t => t._id === taskId ? data.task : t));
    } catch (err) {
      alert('Error updating task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you'd search for user by email and get their ID
      // For now, we'll show how to add a member
      alert('Feature to be implemented: Add member by email');
      setShowMemberModal(false);
      setMemberEmail('');
    } catch (err) {
      alert('Error adding member');
    }
  };

  const isAdmin = project?.members.some(
    m => m.userId._id === user?.id && m.role === 'Admin'
  ) || project?.owner._id === user?.id;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center h-screen">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <button
                onClick={() => navigate('/projects')}
                className="text-blue-600 hover:underline mb-2"
              >
                ← Back to Projects
              </button>
              <h1 className="text-4xl font-bold text-gray-800">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
              >
                + New Task
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">📝 Tasks</h2>
              </div>
              <div className="divide-y">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task._id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                        {isAdmin && (
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded cursor-pointer font-semibold ${
                              task.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        )}
                        {!isAdmin && (
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            task.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>

                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'Urgent'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'High'
                            ? 'bg-orange-100 text-orange-700'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>

                        <span className="text-xs text-gray-500">
                          Assigned: {task.assignedTo.name}
                        </span>

                        <span className="text-xs text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No tasks yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">👥 Members</h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add
                  </button>
                )}
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {project.members.map((member) => (
                  <div key={member.userId._id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {member.userId.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{member.userId.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${
                        member.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Info */}
            <div className="bg-white rounded-lg shadow mt-6 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Project Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-semibold">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {project.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold">
                      {new Date(project.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Task</h2>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Assign To
                  </label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select member</option>
                    {project.members.map((member) => (
                      <option key={member.userId._id} value={member.userId._id}>
                        {member.userId.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;