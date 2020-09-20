

//用来显示可疑的文本
function divEscapedContentElement(message){
    return $('<div></div>').text(message);
};

//用来显示系统创建的受信内容
function divSystemContentElement(message){
    return $('<div></div>').html('<i>' + message + '</i>');
}
//处理原始的用户输入
function processUserInput(chatApp, socket){
    var message = $('#send-message').val();
    var systemMessage;
    //如果用户输入的内容以斜杆开头，将其作为聊天命令
    console.log('processUserInput--->', message.charAt(0))
    if(message.charAt(0) == '/'){
        systemMessage = chatApp.processCommand(message);
        console.log('systemMessage--->',  systemMessage)
        if(systemMessage){
            $('#messages').append(divSystemContentElement(systemMessage));
        }
    }else{
        //将非命令输入广播给其他用户
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divEscapedContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
    }
    $('#send-message').val('');
}

//客户端程序初始化逻辑
// var socket = io();
// console.log('--99--io->', io)
// console.log('--100--socket->', socket)
// console.log('--99000--io->', io.connect())
var socket = io.connect();

$(document).ready(function(){
    var chatApp = new Chat(socket);

    // //显示更名尝试的结果
   socket.on('nameResult', function(result){
        var message;
        if(result.success){
            message = 'Youare now known as ' +result.name + '.';
        }else{
            message = result.message;
        }
        $('#messages').append(divSystemContentElement(message));
    });
    //显示房间变更结果
    socket.on('joinResult', function(result){
        $('#room').text(result.room);
        $('#messages').append(divSystemContentElement('Room changed.'));
    });
    //显示接收到的消息
    socket.on('message', function(message){
        var newElement = $('<div></div>').text(message.text);
        $('#messages').append(newElement);
    })
    //显示可用的房间列表
    socket.on('rooms', function(rooms){
        // console.log('--###000-#room-list--->', rooms)

        $('#room-list').empty();
        // console.log('--###111-#room-list--->', rooms)
        for(var room in rooms){
            // console.log('--##222-#room-list--->', room)
            // room = room.substring(1, room.length);
            room = room.substring(0, room.length);
            // console.log('--##222-#room-list--->', room)
            if(room != ''){
                $('#room-list').append(divEscapedContentElement(room));
            }
        }
        //点击房间名可用换到那个房间中
        $('#room-list div').click(function(){
            chatApp.processCommand('/join ' + $(this).text());
            $('#send-message').focus();
        });
    });
    //定期请求可用房间列表
    setInterval(function(){
        socket.emit('rooms');
    },1000 );
    $('#send-message').focus();
    //提交表单可用发送聊天消息
    
    $('#send-from').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        console.log('77777',  $('#send-message').val())
        processUserInput(chatApp, socket);
        return false;
   });

});