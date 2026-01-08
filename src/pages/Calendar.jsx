import React from 'react'
import './Page.css'

const Calendar = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Calendar</h1>
      </div>
      <div className="page-content">
        <div className="calendar-view">
          <div className="calendar-header">
            <button className="nav-btn">Today</button>
            <button className="nav-btn">←</button>
            <button className="nav-btn">→</button>
            <span className="current-date">January 2024</span>
          </div>
          <div className="calendar-grid">
            <div className="calendar-day-header">
              <div className="day-header">Sun</div>
              <div className="day-header">Mon</div>
              <div className="day-header">Tue</div>
              <div className="day-header">Wed</div>
              <div className="day-header">Thu</div>
              <div className="day-header">Fri</div>
              <div className="day-header">Sat</div>
            </div>
            <div className="calendar-days">
              {/* Placeholder for calendar days */}
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="calendar-day">
                  <span className="day-number">{i < 7 ? i + 1 : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar

