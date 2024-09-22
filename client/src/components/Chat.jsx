import React, { useState, useContext } from 'react';
import { SocketContext } from '../Context';

const Chat = () => {
  const { messages, sendMessage, sendFile, callAccepted, callEnded } = useContext(SocketContext);
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (message) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      sendFile(URL.createObjectURL(selectedFile));
    }
  };

  // If the call is ended or not accepted, display a minimal UI instead of null
  if (!callAccepted || callEnded) {
    return (
      <div className="chat-window">
        <div className="chat-messages">
          <p>Chat will appear once the call is accepted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.from === 'Me' ? 'my-message' : 'other-message'}`}
          >
            {msg.file ? (
              <div className="chat-file">
                {msg.file.endsWith('.mp4') || msg.file.endsWith('.avi') ? (
                  <video controls src={msg.file} className="media-content" />
                ) : (
                  <img src={msg.file} alt="file" className="media-content" />
                )}
              </div>
            ) : (
              <p>{msg.message}</p>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="send-btn">Send</button>
        <input type="file" onChange={handleFileChange} className="file-input" />
      </form>
    </div>
  );
};

export default Chat;
