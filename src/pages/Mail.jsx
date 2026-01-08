import React from 'react'
import './Page.css'

const Mail = () => {
  return (
    <div className="page-container">
      <div className="mail-layout">
        <div className="mail-tabs">
          <button className="tab-button active">Focused</button>
          <button className="tab-button">Other</button>
        </div>
        <div className="mail-content">
          <div className="email-list-pane">
            <div className="email-list">
              <div className="email-item">
                <div className="email-avatar">S</div>
                <div className="email-details">
                  <div className="email-header">
                    <span className="email-sender">Spotify</span>
                    <span className="email-time">04:52</span>
                  </div>
                  <div className="email-subject">Get Premium perks and stre...</div>
                  <div className="email-preview">Listen to nonstop tracks and much...</div>
                </div>
              </div>
              <div className="email-item">
                <div className="email-avatar">G</div>
                <div className="email-details">
                  <div className="email-header">
                    <span className="email-sender">Google</span>
                    <span className="email-time">04:37</span>
                  </div>
                  <div className="email-subject">Security alert</div>
                  <div className="email-preview">You allowed Microsoft apps & servic...</div>
                </div>
              </div>
              <div className="email-item">
                <div className="email-avatar">LA</div>
                <div className="email-details">
                  <div className="email-header">
                    <span className="email-sender">LinkedIn Job Alerts</span>
                    <span className="email-time">04:03</span>
                  </div>
                  <div className="email-subject">Web Developer: Leapforg...</div>
                  <div className="email-preview">Leapforge Digital Web Developer (N...</div>
                </div>
              </div>
              <div className="date-divider">
                <span>Yesterday</span>
              </div>
              <div className="email-item">
                <div className="email-avatar">PL</div>
                <div className="email-details">
                  <div className="email-header">
                    <span className="email-sender">Priyank . via LinkedIn</span>
                    <span className="email-time">Mon 18:02</span>
                  </div>
                  <div className="email-subject">Priyank accepted your i...</div>
                  <div className="email-preview">See Priyank's connections, experienc...</div>
                </div>
              </div>
            </div>
          </div>
          <div className="email-view-pane">
            <div className="empty-state">
              <div className="empty-state-image">
                <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="200" height="150" fill="#f5f5f5"/>
                  <path d="M100 60L60 90L100 120L140 90L100 60Z" stroke="#0078d4" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p>Select an email to view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mail

