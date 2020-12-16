const app = require('express')()
const http = require('http').Server(app)//这里必须绑定在http实例上而不是app上
const io = require('socket.io')(http)

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html')
})

io.on('connection',(socket)=>{
    console.log('--socket--', socket)
    console.log('id',socket.id)//每次connect 的id都不一样
    console.log('a user connected')
})
// io.on('connection',(socket)=>{
//     console.log('a user connected')
//     socket.on('disconnect',()=>{
//         console.log('a user disconnected')
//     })
// })
http.listen(3000,()=>{
    console.log('listening on * :3000')
})