require('dotenv').config()
const express = require("express")
const crypto = require("crypto")

const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)

console.log(crypto.randomBytes(10).map(byte => (byte)%26 + 97).toString('ascii'))
const PORT = process.env.PORT || 3000


app.use(express.static('./src/public'))

app.set('views', './src/views')
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('pages/home')
})

app.get('/:room', (req, res) => {
    if (req.params.room.match(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/))
        res.render('pages/room', {roomId: req.params.room});
    else
        res.send("Invalid Room ID");
})

app.post('/createRoom', (req, res) => {

})
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(PORT, () => {
    console.log(`server listening to http://localhost:${PORT}`)
})