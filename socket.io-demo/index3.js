// const app = require('express')()
// const http = require('http').Server(app)//这里必须绑定在http实例上而不是app上
// const io = require('socket.io')(http)

// app.get('/',(req,res)=>{
//     res.sendFile(__dirname+'/index.html')
// })

// io.on('connection',(socket)=>{
//     socket.on('chat message',(msg)=>{
//         console.log('message:'+msg)
//     })
// })

// http.listen(3000,()=>{
//     console.log('listening on * :3000')
// })

const content = require('fs').readFileSync(__dirname + '/index3.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
  // serve the index.html file
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.end(content);
});

const io = require('socket.io')(httpServer);

io.on('connection',(socket)=>{
    socket.on('chat message',(msg)=>{
        console.log('message:'+msg)
    })
})

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000');
});