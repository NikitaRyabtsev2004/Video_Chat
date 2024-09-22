import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

// Initialize socket
const socket = io('http://localhost:5000');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Get user media (camera and microphone)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    // Listen for 'me' event to get our own socket ID
    socket.on('me', (id) => setMe(id));

    // Listen for incoming call
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  // Function to call another user
  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    // Emit signal when ready
    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    // Handle incoming stream from the other user
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    // When the call is accepted, signal the peer connection
    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // Function to answer an incoming call
  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    // Emit signal back to the caller
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    // Stream the other user's video
    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    // Signal the caller's peer connection
    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  // Function to leave the call
  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();

    // Reset states instead of reloading the page
    setCall({});
    setCallAccepted(false);
    setCallEnded(false);
  };

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall, // Pass answerCall to context
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
