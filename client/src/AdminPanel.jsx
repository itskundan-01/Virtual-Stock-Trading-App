//// filepath: /client/src/AdminPanel.jsx
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_URL } from './config';
import { toast } from 'react-toastify';
import { AuthContext } from './context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
  // State for admin panel data
  const [stats, setStats] = useState({
    userCount: 0,
    stockCount: 0,
    transactionCount: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminRegistrationKey, setAdminRegistrationKey] = useState('');
  const [adminCredentials, setAdminCredentials] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check if user has admin role
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast.error('You do not have permission to access the admin panel');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Fetch dashboard stats
        const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(dashboardResponse.data);

        // Fetch users if on users tab
        if (activeTab === 'users') {
          await fetchUsers();
        }
      } catch (error) {
        console.error('Admin data fetch error:', error);
        toast.error('Failed to load admin panel data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const usersResponse = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Users fetch error:', error);
      toast.error('Failed to load user data');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('User status updated successfully');
      // Refresh user list
      await fetchUsers();
    } catch (error) {
      console.error('Toggle user error:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleAdminRegistration = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (adminCredentials.password !== adminCredentials.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/register`, 
        {
          ...adminCredentials,
          adminKey: adminRegistrationKey
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Admin registered successfully');
      
      // Clear form
      setAdminRegistrationKey('');
      setAdminCredentials({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Admin registration error:', error);
      toast.error(error.response?.data?.message || 'Admin registration failed');
    }
  };

  // Handle input changes for admin registration form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminCredentials({
      ...adminCredentials,
      [name]: value
    });
  };

  // Render appropriate content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'register':
        return renderAdminRegistration();
      default:
        return renderDashboard();
    }
  };

  // Dashboard content
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h3>System Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.userCount}</div>
          <div className="stat-label">Total Users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.stockCount}</div>
          <div className="stat-label">Stocks Available</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.transactionCount}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>
      
      <div className="admin-actions">
        <button onClick={() => setActiveTab('users')} className="admin-button">
          Manage Users
        </button>
        <button onClick={() => setActiveTab('register')} className="admin-button">
          Register New Admin
        </button>
      </div>
    </div>
  );

  // Users management content
  const renderUsers = () => (
    <div className="admin-users">
      <h3>User Management</h3>
      
      {users.length > 0 ? (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.roles?.map(role => role.name.replace('ROLE_', '')).join(', ')}</td>
                  <td>
                    <button 
                      onClick={() => handleToggleUserStatus(user.id)}
                      className="action-button toggle-status"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loading ? (
        <p>Loading users...</p>
      ) : (
        <p>No users found.</p>
      )}
      
      <button onClick={() => setActiveTab('dashboard')} className="back-button">
        Back to Dashboard
      </button>
    </div>
  );

  // Admin registration content
  const renderAdminRegistration = () => (
    <div className="admin-registration">
      <h3>Register New Admin</h3>
      
      <form onSubmit={handleAdminRegistration} className="admin-form">
        <div className="form-group">
          <label htmlFor="adminKey">Admin Registration Key</label>
          <input
            type="text"
            id="adminKey"
            value={adminRegistrationKey}
            onChange={(e) => setAdminRegistrationKey(e.target.value)}
            required
          />
          <small>This is the secret key required to create admin accounts</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={adminCredentials.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={adminCredentials.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={adminCredentials.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={adminCredentials.password}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={adminCredentials.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button">Register Admin</button>
          <button 
            type="button" 
            onClick={() => setActiveTab('dashboard')} 
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="admin-panel-container">
      <h2>Admin Panel</h2>
      <div className="admin-navigation">
        <button 
          className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={`nav-tab ${activeTab === 'register' ? 'active' : ''}`} 
          onClick={() => setActiveTab('register')}
        >
          Register Admin
        </button>
      </div>
      
      <div className="admin-content">
        {loading && activeTab === 'dashboard' ? (
          <p>Loading admin data...</p>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
}

export default AdminPanel;