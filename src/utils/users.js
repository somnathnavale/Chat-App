
const users=[];

const addUser=({id,username,room})=>{
    //clean the data
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    if(!username || !room){
        return{
            error:'username and room are required'
        }
    }

    //check for existing user
    const existingUser=users.find(user=> (user.room===room && user.username===username))
    if(existingUser){
        return{
            error:"username is in use"
        }
    }
    //store user
    const user={id,username,room}
    users.push(user);
    return {user}
}

addUser({
    id:22,
    room:'E7',
    username:"somnath"
})
addUser({
    id:23,
    room:'E7',
    username:"somna"
})
addUser({
    id:24,
    room:'E6',
    username:"somna"
})

const removeUser=(id)=>{
    const index=users.findIndex(user=>user.id===id);
    if(index!==-1){
        return users.splice(index,1)[0];
    }
}

const getUser=id=>users.find(user=>user.id===id);

const getUsersInRoom=room=>users.filter(user=>user.room===room)

module.exports={addUser,removeUser,getUser,getUsersInRoom};