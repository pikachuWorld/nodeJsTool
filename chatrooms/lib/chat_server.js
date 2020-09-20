//声明被提供使用的Socket.IO，并初始化部分定义聊天状态的变量
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

//加载一个定制的Node模块，提供处理基于Socket.IO的服务端聊天功能的，暂未定义。
// var chatServer = require('./lib/chat_server');
// //启动Socket.IO服务器，给她提供一个已经定义好的HTTP服务器，跟HTTP服务器共享同一个TCP/IP端口
// chatServer.listen(server);
console.log('**********chat_server.js***********')

exports.listen = function(server){
    // 启动Socket.IO服务器允许它搭载在已有的HTTP服务器上
    // console.log('***222*******chat_server.j', server)
    io = socketio.listen(server);
    io.set('log level',1);
    //定义每个用户连接处理的逻辑
    // console.log('***222----33333***io', io)
    io.sockets.on('connection',function(socket){
        // console.log('***222----33333***socket', socket)
        //在用户连接上来时赋予一个访问名
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        //在用户连接上来时把他放入聊天室Lobby里
        joinRoom(socket,'Lobby');
        //处理用户的消息，更名，以及聊天室的创建和变更
        handleMessageBroadcasting(socket, nickNames);
        handleNameChangeAttempts(socket, nickNames, namesUsed);
        handleRoomJoining(socket);
        //用户发出请求时，向其提供已经被占用的聊天室的列表
        socket.on('rooms',function(){
                // socket.emit('rooms', io.sockets.manager.rooms);
                socket.emit('rooms', io.sockets.adapter.rooms);  //正确写法
        });
        //定义用户断开连接后的清楚逻辑
        handleClientDisconnection(socket, nickNames, namesUsed);
    });



    
};

//分配用户昵称
function assignGuestName(socket, guestNumber, nickNames, namesUsed){

    //生成新的昵称
    var name = 'Guest' + guestNumber;
    console.log('@@@11分配用户昵称>', 'guestNumber--->', guestNumber, 'nickNames-->', nickNames, 'namesUsed--->', namesUsed)
   
    //把用户的昵称跟客户端连接ID关联上
    nickNames[socket.id] = name;
    //让用户知道他们的昵称
    socket.emit('nameResult', {
        success:true,
        name:name
    });
    //存放已被占用的昵称
    namesUsed.push(name);
    console.log('@@@@33配用户昵称>-->name', name, 'nickName--->', nickNames, 'namesUsed-->', namesUsed)
    //增加用来生产昵称的计数器
    return guestNumber + 1;
}

//进入聊天室相关的逻辑
function joinRoom(socket, room){
    console.log('**joinRoom---进入聊天室相关的逻辑socket-**room--->', room)
   
    //让用户进入房间
    socket.join(room);
   
    //记录用户的当前房间
    currentRoom[socket.id] = room;
    console.log('-- currentRoom-->',  currentRoom)
    //让用户知道他们进入了新的房间
  
    socket.emit('joinResult',{room: room});
    
    //让房间里的其他用户知道有新用户进入了房间
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id] + 'has joined' + room +'.'
    });
    console.log("room55")
  
    //确定有哪些用户在这个房间里
    // var usersInRoom = io.sockets.clients(room);  // 旧版吧
    let usersInRoom = io.sockets.adapter.rooms[room];  //正确写法
    console.log('**joinRoom--usersInRoom-', usersInRoom)
  
    //如果不止一个用户在这个房间里，汇总下有哪些用户
    if(!usersInRoom) return false;
    if(usersInRoom.length > 1){
        var usersInRoomSummary = 'Userd currently in ' + room + ':';
        for(var index in userdInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary += ', ';
                }
                usersInRoomSummary +=nickNames[userSocketId];
            }
        }
        usersInRoomSummary += '.';
        //将房间里其他用户的汇总发送给这个用户
        socket.emit('message', {text:usersInRoomSummary});
    }
    console.log("room77")
}
//更名请求的处理逻辑
function handleNameChangeAttempts(socket, nickNames, namesUsed){
    // console.log('--handleNameChangeAttempts---', socket, 'nickNames-->',  nickNames, 'namesUsed-->', namesUsed)
    //添加nameAttempt事件的监听器
    socket.on('nameAttempt', function(name){
        //昵称不能以Guest开头
        if(name.indexOf('Guest') == 0){
            socket.emit('nameResult',{
                success : false,
                message: 'Names cannot begin with "Guest".'
            });
        }else{
            //如果昵称还没注册就允许注册
            if(namesUsed.indexOf(name) == -1){
                var previousName = nickNames[socket.id]
                var previousNameIndex = namesUsed.indexOf(previousName);
                namesUsed.push(name);
                nickNames[socket.id] = name;
                //删除之前用的昵称，让其他用户可以使用
                delete namesUsed[previousNameIndex];
                socket.emit('nameResult', {
                    success: true,
                    name:name
                });
                socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                    text:previousName + 'is now known as ' + name + '.'
                });
            }else{
                //如果昵称已经被占用，则给客户端发送错误信息
                socket.emit('nameResult', {
                    success: false,
                    message: 'That name is already in use.'
                })
            }
        }
    });
}


//发送聊天消息
function handleMessageBroadcasting(socket){
    socket.on('message',function(message){
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });
}

//创建房间
function handleRoomJoining(socket){

    socket.on('join',function(room){
        console.log('***创建房间', room)
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}
//用户断开连接
function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed(nameIndex);
        delete nickNames[socket.id];
    });
}


