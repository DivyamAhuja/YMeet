import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import './style/room-style.css'

const StyledVideo = styled.video`
    
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, [props.peer]);

    return (
        <StyledVideo playsInline autoPlay ref={ref} />
    );
}

/*
const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};
*/
const iceServers = {
    iceServers: [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19382'},
        {
            urls: "stun:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
        },
        {
            urls: "turn:numb.viagenie.ca",
            username: "sultan1640@gmail.com",
            credential: "98376683"
        }
    ]
}

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.match.params.roomID;
    
    useEffect(() => {
        socketRef.current = io.connect("/");
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            
        })
    }, [roomID]);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            reconnectTimer: 100,
            iceTransportPolicy: 'all',
            trickle: false,
            config: iceServers,
            stream
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            reconnectTimer: 100,
            iceTransportPolicy: 'all',
            trickle: false,
            config: iceServers,
            stream
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    const setMuteButton = () => {
        const html = `
          <i class="fas fa-microphone"></i>
        `
        document.querySelector('.microphone_button').innerHTML = html;
      }
      
      const setUnmuteButton = () => {
        const html = `
          <i class="fas fa-microphone-slash"></i>
        `
        document.querySelector('.microphone_button').innerHTML = html;
      }
      
      const setStopVideo = () => {
        const html = `
          <i class="fas fa-video"></i>
          
        `
        document.querySelector('.video_button').innerHTML = html;
      }
      
      const setPlayVideo = () => {
        const html = `
        <i class="fas fa-video-slash"></i>
          
        `
        document.querySelector('.video_button').innerHTML = html;
      }

    function muteUnmute() {
        let myStream = userVideo.current.srcObject
        const enabled = myStream.getAudioTracks()[0].enabled;
        if (enabled) {
            myStream.getAudioTracks()[0].enabled = false;
            setUnmuteButton()
        } else {
            setMuteButton()
            myStream.getAudioTracks()[0].enabled = true;
        }
    }
    
    function playStop() {
        let myStream = userVideo.current.srcObject
        const enabled = myStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myStream.getVideoTracks()[0].enabled = false;
            setPlayVideo()
        } else {
            setStopVideo()
            myStream.getVideoTracks()[0].enabled = true;
        }
    }

    return (

        <div className="main">
            <div className="main-video-container">
                <div className="main-video">
                    <div id='video-grid'>
                        <StyledVideo muted ref={userVideo} autoPlay playsInline />
                        {
                            peers.map((peer, index) => {
                                return (
                                    <Video key={index} peer={peer} />
                                );
                            })
                        }
                    </div>
                </div>
                <div className="main-video-controls">
                    <div className = "main-controls-block">
                        <div className="control-button microphone_button" onClick={muteUnmute}>
                            <i className="fas fa-microphone"></i>
                        </div>

                        <div className="control-button video_button" onClick={playStop}>
                            <i className="fas fa-video"></i>
                        </div>
                    </div>
                </div>    
            </div>
            <div className="chat-container">

            </div>
        </div>
    );
};

export default Room;
