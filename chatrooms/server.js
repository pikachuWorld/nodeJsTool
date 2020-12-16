//内置的http模块提供了HTTP服务器和客户端功能
var http = require('http');
//内置的fs模块提供了与文件系统相关的功能
var fs = require('fs');
//内置的path模块提供了与文件系统路径相关的功能
var path = require('path');
//附加的mime模块有根据文件扩展名得出mime类型的能力
// var mime = require('mime');
var mime=require('mime-types');
//用来缓存文件内容的对象
var cache = {};
// console.log('###mime###', mime.lookup)

const chatServer = require('./lib/chat_server')


//发送文件数据及错误响应
function send404(response){
    response.writeHead(404,{'Content-Type':'text/plain'});
    response.write('Error 404 : resource not fount.Hi!');
    response.end();
}
//提供文件数据服务
function sendFile(response, filePath, fileContents){
    console.log('----filePath', filePath, '22', path.basename(filePath))
    // console.log('----type',   mime.lookup(path.basename(filePath)))
    // console.log('----fileContents',   mime.lookup(path.basename(filePath)))
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    console.log('----fileContents', fileContents)

    response.end(fileContents);
}
//提供静态文件服务
function serveStatic(response, cache, absPath){
    // console.log('111---', cache[absPath], !!cache[absPath])
    // console.log('11staticcache--', cache, '11--absPath---', absPath)
    if(cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, function(exists){
            // console.log('---exit---', exists, !!exists)
            if(exists){
                fs.readFile(absPath, function(err, data){
                    // console.log('---11data---', absPath, !!absPath)
                    if(err){
                        send404(response);
                    }else{
                        cache[absPath] = data;
                        // console.log('11cache[absPath]--', cache)
                        sendFile(response, absPath, data);
                    }                   
                });
            }else{
                send404(response);
            }
        });
    }   
}
//创建http服务器的逻辑
var server = http.createServer(function(request, response){
    var filePath = false;
    // console.log('-33--11--request.url---', request.url, '9999---->',request.url.indexOf('socket.io.js'))
    if(request.url == '/'){
        filePath = '/index.html';
    } 
    // else if(request.url.indexOf('socket.io.js') > -1){
    //   //node_modules
    //   filePath = 'node_modules' + request.url;
    // }
    else{
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    // console.log('333---cache--', cache, '333--absPath---', absPath)
    serveStatic(response, cache, absPath);
})
// 不加会报连续的错误
var io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log('a user connected');
  });
console.log('--@@@@@@99-Server--', chatServer.listen)
chatServer.listen(server);

//启动http服务器
server.listen(3031, function(){
    console.log("Server listening on port 3031.")
})