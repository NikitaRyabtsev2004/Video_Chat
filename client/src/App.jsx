import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.scss";

const socket = io.connect("localhost:12000");

function App() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [callerName, setCallerName] = useState("");
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const connectionRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Failed to get media stream:", err);
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name); 
      setCallerSignal(data.signal);
    });

    socket.on("callEnded", () => {
      handleCallEnd(true);
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name, 
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.on("close", () => {
      handleCallEnd(false);
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    socket.on("callAccepted", (signal, callerName) => {
      setCallAccepted(true);
      setCallerName(callerName);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: caller,
        name: name,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);

    peer.on("close", () => {
      handleCallEnd(false);
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    connectionRef.current = peer;
    setCallAccepted(true);
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit("endCall", { to: caller });

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    handleCallEnd(false);
  };

  const handleCallEnd = (remote = false) => {
    setCallEnded(true);
    setCallAccepted(false);
    setReceivingCall(false);

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    connectionRef.current = null;

    if (userVideo.current) {
      userVideo.current.srcObject = null;
    }

    if (remote || callEnded) {
      window.location.reload();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(me);
      alert("ID copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy ID: ", err);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Video Chat</h1>
      <div className="video-container">
        <div className="video">
          <h2>{name}</h2>
          {stream && (
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="video-box"
            />
          )}
        </div>
        <div className="video">
          <h2>{callerName}</h2> 
          {callAccepted && !callEnded && (
            <video playsInline ref={userVideo} autoPlay className="video-box" />
          )}
        </div>
      </div>
      <div className="controls">
        <div>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={copyToClipboard}>Copy ID</button>
        </div>
        <div>
          <input
            type="text"
            placeholder="ID to call"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          {callAccepted && !callEnded ? (
            <button onClick={leaveCall}>End Call</button>
          ) : (
            <button onClick={() => callUser(idToCall)}>Call</button>
          )}
        </div>
        <div>
          {receivingCall && !callAccepted && (
            <div>
              <h2>{callerName}...</h2> 
              <button onClick={answerCall}>Answer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
