import React from 'react'
import './Page.css'

const Apps = () => {
  const apps = [
    { name: 'OneDrive', description: 'Cloud storage', icon: '☁️' },
    { name: 'OneNote', description: 'Note taking', icon: '📝' },
    { name: 'Teams', description: 'Collaboration', icon: '💬' },
    { name: 'Word', description: 'Document editor', icon: '📄' },
    { name: 'Excel', description: 'Spreadsheet', icon: '📊' },
    { name: 'PowerPoint', description: 'Presentations', icon: '📊' },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Apps</h1>
      </div>
      <div className="page-content">
        <div className="apps-view">
          <div className="apps-grid">
            {apps.map((app, index) => (
              <div key={index} className="app-card">
                <div className="app-icon">{app.icon}</div>
                <div className="app-name">{app.name}</div>
                <div className="app-description">{app.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Apps

