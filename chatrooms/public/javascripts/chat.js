var Chat = function(socket){
    this.socket =  socket;
};

//发送聊天消息的函数
Chat.prototype.sendMessage = function(room, text){
    console.log('@@@@@@sendMessage ', room, text)
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message',message);
};

//变更房间的函数
Chat.prototype.changeRoom = function(room){
    console.log('--changeRoom', room)
    this.socket.emit('join', {
        newRoom: room
    });
};

//处理聊天的命令
Chat.prototype.processCommand = function(command){
    var words = command.split(' ');
    // console.log('---111processCommand-->', command, 'word-->', words)
    // console.log('---222processCommand-->', words[0].substring(1, words[0].length))
    //从第一个单词开始解析命令
    var command = words[0].substring(1, words[0].length).toLowerCase();
    // console.log('---333processCommand-->', command, '333--word', words )
    var message = false;
    switch(command){
        case 'join':
           words.shift();
            var room = words.join(' ');
            console.log('444swich--->', words, 'room-->', room)
            //处理房间的变换、创建
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            console.log('555nick--->', words, 'name--->',name)

            //处理更名尝试
            this.socket.emit('nameAttempt', name);
            break;
        default:
            //如果命令无法识别，返回错误消息
            message = 'Unrecognized command.';
            break;
    }
    return message;
};