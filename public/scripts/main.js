// import { io } from "socket.io-client";

// const socket = io("https://www.troychance.com", {
//   transports: ["websocket", "polling", "flashsocket"],
//   cors: {
//     origin: "http://localhost:3300",
//     credentials: true,
//   },
//   withCredentials: true,
// });

const socket = io("localhost:3300", {
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
  if (data.length > 0) {
    createOffer();
  }
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
  peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
    createAnswer();
  });
});

const createAnswer = () => {
  peerConnection.createAnswer().then((sdp) => {
    peerConnection.setLocalDescription(sdp);
    socket.emit("answer", sdp);
  }).catch((error) => {
    console.log(error);
  });
};

socket.on("getAnswer", (sdp) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(sdp)).then(() => {
    console.log("set remote description success");
  });
});

socket.on("getCandidate", (candidate) => {
  console.log("get candidate: " + candidate);
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    .then(() => {
      console.log("addIceCandidate success");
    })
    .catch((error) => {
      console.log("addIceCandidate error:", error);
    });
});

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

        stream.getTracks().forEach((track) => {
          console.log('stream added');
          peerConnection.addTrack(track, stream);
        });

        peerConnection.onicecandidate = (e) => {
          if (e.candidate) {
            console.log("onicecandidate");
            socket.emit("candidate", e.candidate);
          }
        };

        peerConnection.oniceconnectionstatechange = (e) => {
          console.log(peerConnection.iceConnectionState);
          console.log(e);
        };

        peerConnection.addEventListener(
          "track",
          async (e) => {
            console.log("add remotetrack success");
            const [remoteStream] = e.streams;
            remoteVideo.srcObject = remoteStream;
          },
          false
        );

        const name = "name" + Math.floor(Math.random(10) * 100);
        console.log(name);

        socket.emit("join", {
          room: "1235",
          name,
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
remoteVideo.style.backgroundColor = 'red';
document.querySelector("#join").addEventListener("click", (e) => init(e));
