import React, { useState, useContext } from 'react';
import { SocketContext } from '../Context';

const Sidebar = ({ children }) => {
  const { me, callAccepted, name, setName, callEnded, leaveCall, callUser } = useContext(SocketContext);
  const [idToCall, setIdToCall] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page refresh
  };

  return (
    <div className="sidebar-container">
      <div className="paper">
        <form className="form-container" onSubmit={handleSubmit}>
          <div className="input-group">
            <h6>Account Info</h6>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
            <button
              type="button" // Changed to "button" to prevent form submission
              className="btn-primary"
              onClick={() => navigator.clipboard.writeText(me)}
            >
              Copy Your ID
            </button>
          </div>

          <div className="input-group">
            <h6>Make a call</h6>
            <input
              type="text"
              placeholder="ID to call"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
              className="input-field"
            />
            {callAccepted && !callEnded ? (
              <button
                type="button" // Changed to "button" to prevent form submission
                className="btn-secondary"
                onClick={leaveCall}
              >
                Hang Up
              </button>
            ) : (
              <button
                type="button" // Changed to "button" to prevent form submission
                className="btn-primary"
                onClick={() => callUser(idToCall)}
              >
                Call
              </button>
            )}
          </div>
        </form>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
