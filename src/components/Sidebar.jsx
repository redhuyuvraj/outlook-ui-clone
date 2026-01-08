import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  MdMail, 
  MdCalendarToday, 
  MdPeople, 
  MdCheckCircle,
  MdApps,
  MdVideoLibrary,
  MdInbox,
  MdDrafts,
  MdArchive,
  MdDelete,
  MdSend,
  MdAdd,
  MdExpandMore,
  MdChevronRight,
  MdLogout
} from 'react-icons/md'
import './Sidebar.css'

const Sidebar = () => {
  const location = useLocation()
  const { signOut } = useAuth()
  const [expandedAccounts, setExpandedAccounts] = useState({
    'redhuyuvraj01': true,
    'psubhajit448': false
  })

  const modules = [
    { id: 'mail', icon: MdMail, label: 'Mail', path: '/mail' },
    { id: 'calendar', icon: MdCalendarToday, label: 'Calendar', path: '/calendar' },
    { id: 'people', icon: MdPeople, label: 'People', path: '/people' },
    { id: 'tasks', icon: MdCheckCircle, label: 'Tasks', path: '/tasks' },
    { id: 'video', icon: MdVideoLibrary, label: 'Video', path: '/video' },
    { id: 'apps', icon: MdApps, label: 'Apps', path: '/apps' }
  ]

  const getActiveModule = () => {
    const currentPath = location.pathname
    const activeModule = modules.find(module => currentPath === module.path || currentPath.startsWith(module.path + '/'))
    return activeModule ? activeModule.id : 'mail'
  }

  const activeModule = getActiveModule()

  const toggleAccount = (accountId) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  return (
    <div className="sidebar">
      {/* Navigation Icons */}
      <div className="sidebar-nav">
        {modules.map(module => {
          const Icon = module.icon
          return (
            <NavLink
              key={module.id}
              to={module.path}
              className={({ isActive }) => `nav-icon ${isActive ? 'active' : ''}`}
              title={module.label}
            >
              <Icon />
            </NavLink>
          )
        })}
      </div>

      {/* Mailbox Structure */}
      <div className="sidebar-content">
        {/* Favorites Section */}
        <div className="favorites-section">
          <div className="section-header">
            <span className="section-title">Favorites</span>
          </div>
          <div className="folder-list">
            <div className="folder-item">
              <MdInbox className="folder-icon" />
              <span className="folder-name">Inbox</span>
              <span className="unread-count">6098</span>
            </div>
            <div className="folder-item">
              <MdDrafts className="folder-icon" />
              <span className="folder-name">Drafts</span>
              <span className="item-count">9</span>
            </div>
            <div className="folder-item">
              <MdArchive className="folder-icon" />
              <span className="folder-name">Archive</span>
              <span className="item-count">1</span>
            </div>
          </div>
        </div>

        {/* Email Accounts */}
        <div className="accounts-section">
          <div className="account-group">
            <button 
              className="account-header"
              onClick={() => toggleAccount('redhuyuvraj01')}
            >
              {expandedAccounts['redhuyuvraj01'] ? (
                <MdExpandMore className="expand-icon" />
              ) : (
                <MdChevronRight className="expand-icon" />
              )}
              <span className="account-name">redhuyuvraj01@gm...</span>
            </button>
            {expandedAccounts['redhuyuvraj01'] && (
              <div className="folder-list">
                <div className="folder-item">
                  <MdInbox className="folder-icon" />
                  <span className="folder-name">Inbox</span>
                  <span className="unread-count">6098</span>
                </div>
                <div className="folder-item">
                  <span className="folder-icon">📧</span>
                  <span className="folder-name">Junk Email</span>
                </div>
                <div className="folder-item">
                  <MdDrafts className="folder-icon" />
                  <span className="folder-name">Drafts</span>
                  <span className="item-count">9</span>
                </div>
                <div className="folder-item">
                  <MdSend className="folder-icon" />
                  <span className="folder-name">Sent Items</span>
                </div>
                <div className="folder-item">
                  <MdDelete className="folder-icon" />
                  <span className="folder-name">Deleted Items</span>
                </div>
                <div className="folder-item">
                  <MdArchive className="folder-icon" />
                  <span className="folder-name">Archive</span>
                  <span className="item-count">1</span>
                </div>
                <div className="folder-item">
                  <span className="folder-icon">📤</span>
                  <span className="folder-name">Outbox</span>
                </div>
              </div>
            )}
          </div>

          <div className="account-group">
            <button 
              className="account-header"
              onClick={() => toggleAccount('psubhajit448')}
            >
              {expandedAccounts['psubhajit448'] ? (
                <MdExpandMore className="expand-icon" />
              ) : (
                <MdChevronRight className="expand-icon" />
              )}
              <span className="account-name">psubhajit448@g...</span>
            </button>
            {expandedAccounts['psubhajit448'] && (
              <div className="folder-list">
                <div className="folder-item">
                  <MdInbox className="folder-icon" />
                  <span className="folder-name">Inbox</span>
                </div>
                <div className="folder-item">
                  <MdDrafts className="folder-icon" />
                  <span className="folder-name">Drafts</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Account Button */}
        <button className="add-account-btn">
          <MdAdd className="add-icon" />
          <span>Add account</span>
        </button>

        {/* Sign Out Button */}
        <button className="signout-btn" onClick={signOut}>
          <MdLogout className="signout-icon" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar

