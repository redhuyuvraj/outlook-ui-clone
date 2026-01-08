import React from 'react'
import './Page.css'

const Video = () => {
  const videos = [
    {
      id: 1,
      title: 'Introduction to React',
      thumbnail: '🎥',
      duration: '10:32',
      views: '1.2K',
      date: '2 days ago'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Concepts',
      thumbnail: '🎥',
      duration: '15:45',
      views: '856',
      date: '5 days ago'
    },
    {
      id: 3,
      title: 'Building Modern UIs with CSS',
      thumbnail: '🎥',
      duration: '8:20',
      views: '2.3K',
      date: '1 week ago'
    },
    {
      id: 4,
      title: 'Git and GitHub Tutorial',
      thumbnail: '🎥',
      duration: '12:15',
      views: '1.8K',
      date: '2 weeks ago'
    },
    {
      id: 5,
      title: 'Responsive Design Principles',
      thumbnail: '🎥',
      duration: '9:30',
      views: '1.5K',
      date: '3 weeks ago'
    },
    {
      id: 6,
      title: 'Node.js Crash Course',
      thumbnail: '🎥',
      duration: '18:00',
      views: '3.1K',
      date: '1 month ago'
    }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Video</h1>
      </div>
      <div className="page-content">
        <div className="video-view">
          <div className="video-header">
            <div className="search-bar">
              <input type="text" placeholder="Search videos..." className="search-input" />
            </div>
            <div className="video-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Recent</button>
              <button className="filter-btn">Popular</button>
            </div>
          </div>
          <div className="videos-grid">
            {videos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <div className="thumbnail-placeholder">{video.thumbnail}</div>
                  <div className="video-duration">{video.duration}</div>
                  <div className="play-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                </div>
                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-meta">
                    <span className="video-views">{video.views} views</span>
                    <span className="video-separator">•</span>
                    <span className="video-date">{video.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Video

