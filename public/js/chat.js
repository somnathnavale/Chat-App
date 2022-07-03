const socket=io();

//message viewer
const inbox=document.querySelector('.inbox');

//template
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll=()=>{
    //new message element
    const $newMessage=inbox.lastElementChild;

    //height of new Message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;

    //visible Height
    const visibleHeight=inbox.offsetHeight;

    //height of Message container
    const containerHeight=inbox.scrollHeight;

    //how far i have scrolled;
    const scrollOffset=inbox.scrollTop+visibleHeight;

    if(containerHeight-newMessageHeight<=scrollOffset){
        inbox.scrollTop=inbox.scrollHeight;
    }

}

socket.on('message',({username,text,createdAt})=>{
    const html=Mustache.render(messageTemplate,{
        username,
        message:text,
        createdAt:moment(createdAt).format('h:mm a'),
    });
    inbox.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('getLocation',({username,url,createdAt})=>{
    const html=Mustache.render(locationTemplate,{
        username,
        location:url,
        createdAt:moment(createdAt).format('h:mm a')
    });
    inbox.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('.chat__sidebar').innerHTML=html;
})

const form=document.querySelector('.form');
const inputMsg=form.elements[0];
const btnMsg=form.elements[1];

form.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(inputMsg.value){
        btnMsg.setAttribute('disabled','disabled');
        socket.emit('clientMsg',inputMsg.value,(error)=>{
            btnMsg.removeAttribute('disabled');
            if(error){
                return console.log(error)
            }
            console.log('message delivered');
        });
        inputMsg.value="";
    }
})

const btnLocation=document.querySelector('.btn-location');

btnLocation.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('Your Browser not supports this feature');
    }
    btnLocation.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        const location=`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
        socket.emit('shareLocation',location,()=>{
            btnLocation.removeAttribute('disabled');
            console.log('location shared');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
});

