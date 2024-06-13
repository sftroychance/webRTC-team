// import { io } from "socket.io-client";

const socket = io("https://www.troychance.com", {
  transports: ["websocket", "polling", "flashsocket"],
  cors: {
    origin: "http://localhost:3300",
    credentials: true,
  },
  withCredentials: true,
});

const pc_config = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const peerConnection = new RTCPeerConnection(pc_config);

socket.on("connect", () => {
  console.log("Hello, successfully connected to the signaling server!");
});

socket.on("room_users", (data) => {
  console.log("join:" + data);
  createOffer();
});

const createOffer = () => {
  console.log("create offer");
  peerConnection
    .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
    .then((sdp) => {
      peerConnection.setLocalDescription(sdp);
      socket.emit("offer", sdp);
    })
    .catch((error) => {
      console.log(error);
    });
};

socket.on("getOffer", (sdp) => {
  console.log("get offer:" + sdp);
  createAnswer(sdp);
});

const createAnswer = (sdp) => {
  peerConnection.setRemoteDescription(sdp).then(() => {
    console.log("answer set remote description success");
    peerConnection
      .createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      })
      .then((sdp1) => {
        console.log("create answer");
        peerConnection.setLocalDescription(sdp1);
        socket.emit("answer", sdp1);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

async function init(e) {
  console.log("render videos");
  try {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        localVideo.srcObject = stream;
        // if (localVideo.current) localVideo.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
        peerConnection.onicecandidate = (e) => {
          if (e.candidate) {
            console.log("onicecandidate");
            socket.emit("candidate", e.candidate);
          }
        };
        peerConnection.oniceconnectionstatechange = (e) => {
          console.log(e);
        };

        peerConnection.ontrack = (ev) => {
          console.log("add remotetrack success");
          remoteVideo.srcObject = ev.streams[0];
          //   if (remoteVideo.current)
          //     remoteVideo.current.srcObject = ev.streams[0];
        };

        socket.emit("join", {
          room: "1234",
          name: "name" + Math.floor(Math.random(5) * 10),
        });
      })
      .catch((error) => {
        console.log(`getUserMedia error: ${error}`);
      });
  } catch (e) {
    console.log(e);
  }
}

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
document.querySelector("#join").addEventListener("click", (e) => init(e));
