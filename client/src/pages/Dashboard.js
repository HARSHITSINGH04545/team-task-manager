// // client/src/pages/Dashboard.js
// import React, { useState, useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { AuthContext } from '../context/AuthContext';

// const Dashboard = () => {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [tasks, setTasks] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [stats, setStats] = useState({
//     totalTasks: 0,
//     completedTasks: 0,
//     pendingTasks: 0,
//     overdueTasks: 0
//   });
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);
// //   const fetchDashboardData = async () => {
// //     try {
// //       setLoading(true);
// //    const token = localStorage.getItem('token');
// // const [tasksRes, projectsRes] = await Promise.all([
// //   axios.get('http://localhost:5000/api/tasks', {
// //     headers: { Authorization: `Bearer ${token}` }
// //   }),
// //   axios.get('http://localhost:5000/api/projects', {
// //   })
// // ]);
// //       const tasksData = tasksRes.data.tasks || [];
// //       const projectsData = projectsRes.data.projects || [];
// //       setTasks(tasksData);
// //       setProjects(projectsData);
// //       // Calculate stats
// //       const now = new Date();
// //       const completed = tasksData.filter(t => t.status === 'Completed').length;
// //       const pending = tasksData.filter(t => t.status === 'Pending').length;
// //       const overdue = tasksData.filter(
// //         t => new Date(t.dueDate) < now && t.status !== 'Completed'
// //       ).length;
// //       setStats({
// //         totalTasks: tasksData.length,
// //         completedTasks: completed,
// //         pendingTasks: pending,
// //         overdueTasks: overdue
// //       });
// //     } catch (err) {
// //       console.error('Error fetching dashboard data:', err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
//   const fetchDashboardData = async () => {
//   try {
//     setLoading(true);
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.error("No token found");
//       return;
//     }
//     const [tasksRes, projectsRes] = await Promise.all([
//       axios.get('http://localhost:5000/api/tasks', {
//         headers: { Authorization: `Bearer ${token}` }
//       }),
//       axios.get('http://localhost:5000/api/projects', {
//       })
//     ]);
//     const tasksData = tasksRes.data.tasks || [];
//     const projectsData = projectsRes.data.projects || [];
//     setTasks(tasksData);
//     setProjects(projectsData);
//     const now = new Date();
//     const completed = tasksData.filter(t => t.status === 'Completed').length;
//     const pending = tasksData.filter(t => t.status === 'Pending').length;
//     const overdue = tasksData.filter(
//       t => new Date(t.dueDate) < now && t.status !== 'Completed'
//     ).length;
//     setStats({
//       totalTasks: tasksData.length,
//       completedTasks: completed,
//       pendingTasks: pending,
//       overdueTasks: overdue
//     });
//   } catch (err) {
//     console.error('Error fetching dashboard data:', err);
//   } finally {
//     setLoading(false);
//   }
// };
//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }
//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-800 mb-2">
//             👋 Welcome, {user?.name}!
//           </h1>
//           <p className="text-gray-600">Here's your task overview</p>
//         </div>
//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white rounded-lg shadow p-6">
//             <h3 className="text-gray-500 text-sm font-semibold mb-2">TOTAL TASKS</h3>
//             <p className="text-3xl font-bold text-blue-600">{stats.totalTasks}</p>
//           </div>
//             <h3 className="text-gray-500 text-sm font-semibold mb-2">COMPLETED</h3>
//             <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
//             <h3 className="text-gray-500 text-sm font-semibold mb-2">PENDING</h3>
//             <p className="text-3xl font-bold text-yellow-600">{stats.pendingTasks}</p>
//             <h3 className="text-gray-500 text-sm font-semibold mb-2">OVERDUE</h3>
//             <p className="text-3xl font-bold text-red-600">{stats.overdueTasks}</p>
//         {/* Recent Tasks */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b">
//                 <h2 className="text-xl font-bold text-gray-800">📝 Recent Tasks</h2>
//               </div>
//               <div className="divide-y">
//                 {tasks.slice(0, 5).length > 0 ? (
//                   tasks.slice(0, 5).map((task) => (
//                     <div key={task._id} className="p-4 hover:bg-gray-50 cursor-pointer">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h3 className="font-semibold text-gray-800">{task.title}</h3>
//                           <p className="text-sm text-gray-500 mt-1">
//                             Assigned to: {task.assignedTo.name}
//                           </p>
//                         </div>
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                           task.status === 'Completed'
//                             ? 'bg-green-100 text-green-800'
//                             : task.status === 'In Progress'
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {task.status}
//                         </span>
//                       </div>
//                       <div className="mt-2 flex gap-2">
//                         <span className={`text-xs px-2 py-1 rounded ${
//                           task.priority === 'Urgent'
//                             ? 'bg-red-100 text-red-700'
//                             : task.priority === 'High'
//                             ? 'bg-orange-100 text-orange-700'
//                             : 'bg-gray-100 text-gray-700'
//                           {task.priority}
//                         <span className="text-xs text-gray-500">
//                           Due: {new Date(task.dueDate).toLocaleDateString()}
//                     </div>
//                   ))
//                 ) : (
//                   <div className="p-4 text-center text-gray-500">No tasks yet</div>
//                 )}
//             </div>
//           {/* Projects */}
//           <div>
//                 <h2 className="text-xl font-bold text-gray-800">📁 My Projects</h2>
//               <div className="divide-y max-h-96 overflow-y-auto">
//                 {projects.length > 0 ? (
//                   projects.map((project) => (
//                     <div
//                       key={project._id}
//                       onClick={() => navigate(`/projects/${project._id}`)}
//                       className="p-4 hover:bg-gray-50 cursor-pointer"
//                     >
//                       <h3 className="font-semibold text-gray-800">{project.name}</h3>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {project.members.length} members
//                       </p>
//                       <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
//                         project.status === 'Active'
//                           ? 'bg-green-100 text-green-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}>
//                         {project.status}
//                       </span>
//                   <div className="p-4 text-center text-gray-500">No projects yet</div>
//               <div className="p-4 border-t">
//                 <button
//                   onClick={() => navigate('/projects')}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
//                 >
//                   View All Projects
//                 </button>
//       </div>
//     </div>
//   );
// export default Dashboard;


// ```jsx
// client/src/pages/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }

      const [tasksRes, projectsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const tasksData = tasksRes.data.tasks || [];
      const projectsData = projectsRes.data.projects || [];

      setTasks(tasksData);
      setProjects(projectsData);

      const now = new Date();
      const completed = tasksData.filter(t => t.status === 'Completed').length;
      const pending = tasksData.filter(t => t.status === 'Pending').length;
      const overdue = tasksData.filter(
        t => new Date(t.dueDate) < now && t.status !== 'Completed'
      ).length;

      setStats({
        totalTasks: tasksData.length,
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            👋 Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's your task overview</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <h3>TOTAL TASKS</h3>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3>COMPLETED</h3>
            <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3>PENDING</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3>OVERDUE</h3>
            <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tasks */}
          <div className="lg:col-span-2 bg-white rounded shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">Recent Tasks</h2>
            </div>

            {tasks.length > 0 ? (
              tasks.slice(0, 5).map(task => (
                <div key={task._id} className="p-4 border-b">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-gray-500">
                    Assigned to: {task.assignedTo?.name}
                  </p>

                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {task.status}
                    </span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500">No tasks yet</p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold">My Projects</h2>
            </div>

            {projects.length > 0 ? (
              projects.map(project => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="p-4 border-b cursor-pointer hover:bg-gray-50"
                >
                  <h3>{project.name}</h3>
                  <p className="text-xs text-gray-500">
                    {project.members.length} members
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-gray-500">No projects yet</p>
            )}

            <div className="p-4">
              <button
                onClick={() => navigate('/projects')}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                View All Projects
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// ```
