const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const {generateMessage, generateLocation}=require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);

const PORT=process.env.PORT || 5000;

app.use(express.static(path.join(__dirname,'../public')));

io.on('connection',(socket)=>{
    console.log('new websocket connection');
    
    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room});
        if(error){
            return callback(error)
        }
        socket.join(user.room);
        socket.emit('message',generateMessage('Admin',`welcome to ${user.room} chat-room`));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`A ${user.username} Has Joined`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('clientMsg',(msg,callback)=>{
        const user=getUser(socket.id);
        if(user){
            const filter=new Filter();
            if(filter.isProfane(msg)){
                return callback('profanity is not allowed');
            }
            io.to(user.room).emit('message',generateMessage(user.username,msg));
            callback();
        }
    })

    socket.on('shareLocation',(location,callback)=>{
        const user=getUser(socket.id);
        if(user){
            io.to(user.room).emit('getLocation',generateLocation(user.username,location));   
            callback();
        }
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has Left`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
})