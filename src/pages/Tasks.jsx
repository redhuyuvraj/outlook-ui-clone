import React, { useState } from 'react'
import './Page.css'

const Tasks = () => {
  const [tasks] = useState([
    { id: 1, title: 'Complete project proposal', completed: false, dueDate: '2024-01-15' },
    { id: 2, title: 'Review team feedback', completed: false, dueDate: '2024-01-16' },
    { id: 3, title: 'Schedule meeting with client', completed: true, dueDate: '2024-01-14' },
    { id: 4, title: 'Update documentation', completed: false, dueDate: '2024-01-17' },
  ])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Tasks</h1>
      </div>
      <div className="page-content">
        <div className="tasks-view">
          <div className="tasks-header">
            <button className="new-task-btn">+ New Task</button>
          </div>
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => {}}
                  className="task-checkbox"
                />
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-due">Due: {task.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks

