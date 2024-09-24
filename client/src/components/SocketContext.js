import { createContext, useContext, useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Peer } from "simple-peer";

const SocketContext = createContext();

const socket = io("http://localhost:5000");

export const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnd, setCallEnd] = useState(false);
  const myVideo = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.on("me", (id) => setMe(id));
    socket.on("callUser", ({ signal, from, name: callerName }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });
  };
  const callUser = () => {};
  const leaveCall = () => {};

  return <SocketContext.Provider>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  return useContext(SocketContext);
};
