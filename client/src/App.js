import React from 'react';
import Notifications from './components/Notifications';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';

const App = () => {
  return (
    <div className="app-wrapper">
      <header className="app-bar">
        <h2 className="app-title">Video Chat</h2>
      </header>
      <VideoPlayer />
      <Sidebar>
        <Notifications />
      </Sidebar>
    </div>
  );
};

export default App;
