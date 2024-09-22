import React, { useContext } from 'react';
import { SocketContext } from '../Context';

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call } = useContext(SocketContext);

  return (
    <div className="video-player-grid">
      {stream && (
        <div className="video-container">
          <h5>{name || 'Name'}</h5>
          <video playsInline muted ref={myVideo} autoPlay className="video-element" />
        </div>
      )}
      {callAccepted && !callEnded && (
        <div className="video-container">
          <h5>{call.name || 'Name'}</h5>
          <video playsInline ref={userVideo} autoPlay className="video-element" />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
