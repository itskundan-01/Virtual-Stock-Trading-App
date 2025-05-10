import { useContext, useState, useEffect } from 'react'
import { AuthContext } from './context/AuthContext'
import axios from 'axios'
import { API_URL } from './config'
import { toast } from 'react-toastify'
import './Profile.css'

function Profile() {
  const { user } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProfile(response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        toast.error('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return <div className="profile-container">Loading profile data...</div>
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      <div className="profile-card">
        <h3>{user?.name || 'User'}</h3>
        <p><strong>Email:</strong> {user?.email}</p>
        
        <div className="profile-actions">
          <button className="profile-button">Edit Profile</button>
        </div>
      </div>
      
      <div className="profile-section">
        <h3>Account Settings</h3>
        <ul className="settings-list">
          <li>Change Password</li>
          <li>Notification Preferences</li>
          <li>Privacy Settings</li>
        </ul>
      </div>
    </div>
  )
}

export default Profile
