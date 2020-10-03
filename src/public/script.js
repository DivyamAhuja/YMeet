const socket = io('/')
const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})
peer.on('open', id =>  socket.emit('join-room', ROOM_ID, id))


const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)
    peer.on('call', call => {
        call.answer(stream)
        const myVideo = document.createElement('video')
        addVideoStream(myVideo, stream)
        videoGrid.append(myVideo)
    })
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const userVideo = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(userVideo, userVideoStream)
    })
    call.on('close', () => {
        userVideo.remove()
    })

    peers[userId] = call
}