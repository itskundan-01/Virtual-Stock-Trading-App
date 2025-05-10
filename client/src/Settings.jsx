import { useContext } from 'react'
import { AuthContext } from './context/AuthContext'
import './Settings.css' // Will create this later if needed
import { toast } from 'react-toastify'

function Settings() {
  const { user } = useContext(AuthContext)

  const handleSettingChange = (setting) => {
    toast.info(`${setting} setting will be updated soon`)
  }

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      <div className="settings-card">
        <h3>Security</h3>
        <div className="settings-item" onClick={() => handleSettingChange('Password')}>
          <div className="setting-info">
            <h4>Change Password</h4>
            <p>Update your account password</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
        
        <div className="settings-item" onClick={() => handleSettingChange('Two-factor authentication')}>
          <div className="setting-info">
            <h4>Two-factor Authentication</h4>
            <p>Add an extra layer of security to your account</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
      </div>
      
      <div className="settings-card">
        <h3>Preferences</h3>
        <div className="settings-item" onClick={() => handleSettingChange('Notifications')}>
          <div className="setting-info">
            <h4>Notification Settings</h4>
            <p>Control how and when you receive notifications</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
        
        <div className="settings-item" onClick={() => handleSettingChange('Display')}>
          <div className="setting-info">
            <h4>Display Settings</h4>
            <p>Customize your trading interface</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
      </div>
      
      <div className="settings-card">
        <h3>Account</h3>
        <div className="settings-item" onClick={() => handleSettingChange('Privacy')}>
          <div className="setting-info">
            <h4>Privacy Settings</h4>
            <p>Control your data and privacy settings</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
        
        <div className="settings-item danger" onClick={() => handleSettingChange('Account deletion')}>
          <div className="setting-info">
            <h4>Delete Account</h4>
            <p>Permanently delete your account</p>
          </div>
          <span className="settings-arrow">›</span>
        </div>
      </div>
    </div>
  )
}

export default Settings