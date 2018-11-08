var express = require('express');
var session = require('express-session');
var path = require('path');
//var sassMiddleware = require('node-sass-middleware');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sql = require('mysql');
var db = require('./db.js');
var moniker = require('moniker');
var Room = require('./room.js');
var app = express();
var fs = require('fs');
var port = process.env.PORT || 3002;
var fileRoot = './public/chatHistory'
var io = require('socket.io').listen(app.listen(port));

var sessionMiddleware = session({
  name: 'classchat_session',
  secret: 'secret',
  cookie: { maxAge: null },
  resave: true,
  saveUninitialized: true
});
/*var user_table = sql.define({
  name: 'users',
  columns: ['id', 'name', 'email', 'password']
});
var room_table = sql.define({
  name: 'rooms',
  columns: ['id', 'name', 'type', 'private', 'maximum', 'chathistory', 'admin', 'ban']
});*/

//configure mysql
// const config = {
//   "host": "localhost",
//   "user": "root",
//   "password": "tttt0430",
//   "base": "ClassChat_User"
// };

// var db = mysql.createConnection({
//   host: config.host,
//   user: config.user,
//   password: config.password,
//   database: config.base
// });

/*db.connect(function (error) {
  if (!!error)
    throw error;
  //console.log('mysql connected to ' + config.host + ", user " + config.user + ", database " + config.base);
});*/

var names = moniker.generator([moniker.adjective, moniker.noun]);

//configure app
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// app.use(
//   sassMiddleware({
//     src: __dirname + '/sass',
//     dest: __dirname + '/public/stylesheets',
//     outputStyle: 'compressed',
//     prefix: '/stylesheets'
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

io.use(function (socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

/* SESSION INFO */
// username: stored as string
// userRooms: object, key = name, val = id
// previousRooms: array of userRooms keys (before adding new)

var rooms = {};
//rooms['lobby'] = new Room('Lobby', 'lobby');
var chatHistory = {};
//var myroom = {};
//chatHistory['lobby'] = [];
//writeToFile();

/* ROUTES */
app.get('/', function (req, res) {
  /*if (!req.session.previousRooms) {
    req.session.previousRooms = [];
  }
  if (!req.session.userRooms) {
    req.session.userRooms = {};
  }*/

  //set previous rooms to user rooms before adding new room to list
  /*req.session.previousRooms = Object.keys(req.session.userRooms);
  if (!req.session.userRooms['Lobby']) {
    req.session.userRooms['Lobby'] = 'lobby';
  }*/
  console.log(req.session.username);
  res.render('home', { private: false });
});

app.get('/roomlist', function (req, res) {
  if(req.session.email ){
  /*if (!req.session.previousRooms) {
    req.session.previousRooms = [];
  }
  if (!req.session.userRooms) {
    req.session.userRooms = {};
  }*/

  //set previous rooms to user rooms before adding new room to list
  /*req.session.previousRooms = Object.keys(req.session.userRooms);
  if (!req.session.userRooms['Lobby']) {
    req.session.userRooms['Lobby'] = 'lobby';
  }*/
  console.log(req.session.username);
  res.render('list', { private: false });
  }else{
    return res.redirect('/');
  }
});

// app.get('/login', function (req, res) {
//   if (!req.session.previousRooms) {
//     req.session.previousRooms = [];
//   }
//   if (!req.session.userRooms) {
//     req.session.userRooms = {};
//   }
//   //set previous rooms to user rooms before adding new room to list
//   req.session.previousRooms = Object.keys(req.session.userRooms);
//   if (!req.session.userRooms['Lobby']) {
//     req.session.userRooms['Lobby'] = 'lobby';
//   }

//   res.render('login', { private: false });
// });

// app.get('/createRoom', function(req, res){
//   res.render('createroom', { private: true });
// });

app.get('/chats/:id', function (req, res) {
  console.log(req.session.username);
  if(!req.session.username){
    req.session.username = randomName();
  }
  var id = req.params.id;
  var type = rooms[id].type;
  /*if (!req.session.previousRooms) {
    req.session.previousRooms = [];
  }
  if (!req.session.userRooms) {
    req.session.userRooms = {};
  }
  if (rooms[id]) {
    req.session.previousRooms = Object.keys(req.session.userRooms);
    var name = rooms[id].name;
    req.session.userRooms[name] = id;
  }*/
  if(type === 'tradition'){
    res.render('chatroom', { private: true });
  }else{
    res.render('newchatroom', { private: true });
  }
});

app.get('/userSession', function(req, res){
  var status = false;
  if(req.session.username && req.session.email){
    status = true;
  }
  res.send({session: status});
});

app.get('/roomAdmin/:id', function(req, res){
  var isAdmin = false;
  var id = req.params.id;
  var admin = rooms[id].admin;
  if(req.session.email == admin){
    isAdmin = true;
  }
  res.send({isAdmin: isAdmin});
});

app.post('/userLogin', function (req, res) {
  console.log(req.body);
  console.log(req.body.username);
  console.log(req.body.password);
  db.query("SELECT * FROM user WHERE name=? AND password=?", [req.body.username, req.body.password], function (err, rows, fields) {
    if (rows.length == 0) {
      console.log("login failed");
      res.status(500).send({error: 'you have an error'}); 
      //socket.emit('login failed', "Username or password may be wrong, please try again.");
    } else {
      console.log("login success",rows[0].email);
      req.session.username = req.body.username;
      req.session.email = rows[0].email;
      var usersroom = [];
      if(rows[0].rooms != null){
        //usersroom = JSON.parse(rows[0].rooms);
        //console.log(myroom[rows[0].email]);
      }
      //myroom[req.session.email] = usersroom;
      console.log(req.session.username);
      res.send(req.body);
      //socket.emit('login success');
    }
  });
});

app.post('/userLogout', function (req, res) {
  console.log("logout", req.session.username, req.session.email);
  /*update user in db*/
  
  //delete myroom[req.session.eamil];
  req.session.username = null;
  req.session.email = null;
  // req.logout();
  //res.render('home', { private: false });
  res.send(req.body);
});

app.post('/userRegister', function (req, res) {
  console.log(req.body.data);
  console.log(req.body.email);
  console.log(req.body.username);
  console.log(req.body.password);
  console.log(req.body.confirm_password);
  if(req.body.password != req.body.confirm_password){
    
    res.send({type: 'error', msg: 'confirm your password'}); 
    
  }else{

    db.query("select * from user where email=?", req.body.email, function(err, result){
      if(result.length == 0){

        db.query("INSERT INTO user(`email`, `password`, `name`, `rooms`) VALUES(?, ?, ?, ?)", [req.body.email, req.body.password, req.body.username, JSON.stringify([])], function(err, result){
          if(!!err){
            throw err;
          }
          console.log(result);
          if(!err){
            console.log('register success');
            console.log('me fail');
            req.session.username = req.body.username;
            req.session.email = req.body.email;
            res.send(req.body);
            
          }else{
            console.log("login failed");
            res.send({type: 'error', msg: 'insert fail'}); 
          }
        });
      }else{
            res.send({type: 'error', msg: 'insert fail'});
      }
        
    });
  }
});

app.post('/submitUsername', function (req, res) {
  req.session.username = req.body.name;
  res.send(req.body);
});

app.post('/submitRoom', function (req, res) {
  rooms[req.body.roomId] = new Room(req.body.roomName, req.body.roomId, req.body.roomType, req.body.roomAdmin, req.body.roomMaximum);
  res.send(req.body);
});

app.delete('/deleteRoom', function (req, res) {
  var toDelete = req.body.roomName;
  var id = req.session.userRooms[toDelete];
  var room = rooms[id];
  if (room) {
    --room.numReferences;
  }
  var index = req.session.previousRooms.indexOf(toDelete);
  if (index != -1) {
    req.session.previousRooms.splice(index, 1);
  }
  delete req.session.userRooms[toDelete];

  //delete room from system of 0 users and 0 references
  if (rooms[id].numUsers === 0) {
    if (rooms[id].numReferences == 0) {
      //write to file
      writeToFile(id, chatHistory[id]);
      console.log('write file end');
      delete rooms[id];
      delete chatHistory[id];
    }
  }
  res.send(req.body);
});


/* CHAT SOCKET */

io.sockets.on('connection', function (socket) {
  // if(socket.request.session.username === undefined){
  //   socket.request.session.username = randomName();
  // }
  //var username = socket.request.session.username;
  console.log('connection: ' + socket.request.session.username);
  //check if room at incoming request exists

  socket.on('load', function (roomId) {
    //set socket room id to path given
    socket.room = roomId;
    console.log('load room: ' + socket.room);
    var roomName = null;
    if (rooms[roomId]) {
      var roomName = rooms[roomId].name;
      checkSession(socket, roomId, roomName, rooms[roomId].memberList());
    }else {
      db.query("SELECT * FROM room WHERE pincode=? ", [roomId], function (err, rows, fields) {
        if (rows.length == 0) {
          console.log("not exist!");
          socket.emit('page does not exist');
        }else {
          /*restore room from db*/
          socket.emit('rebuild room', rows[0].id);
        }
      });
    } 
  });

  socket.on('login', function(data){
    login(socket, data);
  });

  socket.on('register', function(data){
    register(socket, data);
  });

  //check if room name is available
  socket.on('check roomName', function (data) {
    if (socket.userRooms && socket.userRooms[data.roomName]) {
      socket.emit('roomName failed');
    } else {
      socket.emit('roomName passed');
    }
  });

  socket.on('check login',function(){
    if(socket.request.session.email == null){
      console.log('is not login');
      socket.emit('redirect to login page');
    }else{
       socket.emit('go create room');
    }
  })

  //create room from name and randomly generated id, join
  socket.on('create room', function (data) {
    if(socket.request.session.email == null){
      socket.emit('redirect to login page');
    }else{
      var userEmail = socket.request.session.email;
      console.log('create room');
      var room = new Room(data.roomName, data.roomId, data.roomType, data.roomAuthority, socket.request.session.email, data. roomMaximum);
      console.log(data.roomName, data.roomId, data.roomType, data.roomAuthority, socket.request.session.email, data. roomMaximum);
      //roomId = data.roomId;
  
      rooms[data.roomId] = room;
      console.log(room);
      // console.log(Object.keys(rooms).length);
      chatHistory[data.roomId] = [];
      /*new row to db*/
      var sqlText = db.format("INSERT INTO room(`name`, `type`, `private`, `maximum`, `admin`, `pincode`) VALUES(?, ?, ?, ?, ?, ?)", [data.roomName, data.roomType, data.roomAuthority, data.roomMaximum, socket.request.session.email,   data.roomId.toString()]);
      /*add to userroom*/

      console.log(sqlText);
      db.query(sqlText, function(err, result){
        //myroom[userEmail].push(result.insertId);
        console.log('insert result: ');
        //console.log(result.insertId);
        console.log('insert err: ');
        console.log(err);
     });
       
      /*redirect*/
      socket.emit('redirect to room', { id: data.roomId });
    }
  });
  socket.on('reload room', function(data){
    db.query("SELECT * FROM room WHERE id=? ", [data.id], function (err, rows, fields) {
      if(rows.length == 0){
        console.log('room not found');
      }else{
        if(rows[0].pincode == null){
          console.log('reload in reload room');
          //socket.emit('rebuild room', data.id)
          rebuildRoom(socket, data);
        }else{
          /*redirect*/
          if(rooms[rows[0].pincode] != null){
            socket.emit('redirect to room', {id: rows[0].pincode});
          }else{
            console.log("room not exist!");
            socket.emit('page does not exist');
          }
        }
      }
    });
  });

  //
  socket.on('check username', function (data) {
    if (rooms[data.roomId] && !rooms[data.roomId].contains(data.username)) {
      socket.emit('username passed', {
        username: data.username
      });
    } else {
      socket.emit('username failed');
    }
  });

  socket.on('query roomlist', function(){
    console.log("query roomlist, user: " , socket.request.session.email);
    db.query("SELECT * FROM user WHERE email=?", [socket.request.session.email], function (err, rows, fields) {
      if (rows.length == 0) {
        console.log("user not exist in db");
        //socket.emit('login failed', "Username or password may be wrong, please try again.");
      } else {
        //var data = [];
        if(rows[0].rooms != null){
          var roomlist = JSON.parse(rows[0].rooms);
          console.log(roomlist);
          for(var i = 0; i<roomlist.length; i++){
            db.query("SELECT * FROM room WHERE id=?", [roomlist[i]], function (err, roomrows, fields){
              if (roomrows.length == 0) {
                console.log("room not exist in db");
              }else{
                var isAdmin = false;
                if(roomrows[0].admin == socket.request.session.email){
                  isAdmin = true;
                }
                //console.log(roomrows[0]);
                // roomrows[0].push({
                //   key: "isAdmin",
                //   value: isAdmin
                // });
                var roomInfo = {
                  info: JSON.parse(JSON.stringify(roomrows[0])),
                  isAdmin: isAdmin
                }
                //data.push(roomInfo);
                //console.log('load roomlist page' ,data);
                socket.emit('load roomlist page' ,roomInfo);
                // console.log(roomInfo);
                // console.log(data);
              }
            });
          }
        }else{

        }
      }
    });
  });

  socket.on('remove room', function (data) {
    var roomId = socket.userRooms[data.roomName];
    if (data.roomName === rooms[socket.room].name) {
      socket.emit('cannot remove room');
    } else {
      socket.emit('remove room', {
        roomName: data.roomName
      });
    }
  });

  //called on valid submission of username
  socket.on('add user', function (data) {
    joinRoom(socket, data.roomId, rooms[data.roomId].name);
    addUser(socket, data.username);
  });

  socket.on('new message', function (msg) {
    console.log(msg);
    var dt = (+new Date());
    //socket.broadcast.to(socket.room).emit('new message', {
    io.in(socket.room).emit('new message', {  
      msgid: chatHistory[socket.room].length,
      username: socket.username,
      message: msg,
      score: 1,
      userlist: [socket.username],
      type: rooms[socket.room].type,
      time: dt
    });

    if (chatHistory[socket.room].length >= 10) {
      chatHistory[socket.room].splice(0, 1);
    }

    var msgObject = { msgid: chatHistory[socket.room].length, username: socket.username, message: msg, score: 1, userlist: [socket.username], time: dt};
    chatHistory[socket.room].push(msgObject);
    console.log('input to pincode: '+socket.room);
  });

  socket.on('add voting', function(data){
    console.log('add',data);
    chatHistory[socket.room][data.msgId].score += 1;
    chatHistory[socket.room][data.msgId].userlist.push(data.username);
    io.in(socket.room).emit('score change', {
      msgid: data.msgId,
      score: chatHistory[socket.room][data.msgId].score,
      userlist: chatHistory[socket.room][data.msgId].userlist,
      username: data.username
    });
  });

  socket.on('minus voting', function(data){
    console.log('minus',data);
    chatHistory[socket.room][data.msgId].score -= 1;
    var index = chatHistory[socket.room][data.msgId].userlist.indexOf(data.username);
    if (index !== -1) chatHistory[socket.room][data.msgId].userlist.splice(index, 1);
    io.in(socket.room).emit('score change', {
      msgid: data.msgId,
      score: chatHistory[socket.room][data.msgId].score,
      userlist: chatHistory[socket.room][data.msgId].userlist,
      username: data.username
    });
  });

  socket.on('typing', function () {
    socket.broadcast.to(socket.room).emit('typing', {
      username: socket.username
    });
  });

  socket.on('stop typing', function () {
    socket.broadcast.to(socket.room).emit('stop typing', {
      username: socket.username
    });
  });

  socket.on('disconnect', function () {
    var room = socket.room;
    if (socket.joinedRoom && rooms[room]) {
      var members = rooms[room].members;
      //disconnect user socket from room
      socket.leave(room);

      //if only one socket from that user, delete
      socket.broadcast.to(room).emit('user left', {
          username: socket.username,
          numUsers: rooms[room].numUsers
      });
      if (members[socket.username] === 1) {
        console.log('ONLY ONE SOCKET, DELETING USER')
        --rooms[room].numUsers;
        rooms[room].removeMember(socket.username);
        if(rooms[room].numUsers == 0){
          //write back to db
          
          if(rooms[room].history != ""){
            fs.unlink(fileRoot+"/"+rooms[room].history+".json");
          }
          var fileName = 'history_'+room+"_"+Date.now();
          db.query("update room set chathistory=? where pincode=?", [fileName, room]);

          
          //write history to file
          db.query("update room set pincode=? where pincode=?", [null, room]);
          writeToFile(fileName, chatHistory[room]);
          console.log('room: '+room+" is deleted!");
          //delete rooms[room];
        }
        
        if(rooms[room].numUsers == 0){
          delete rooms[room];
        }
      }
      //if multiple sockets connected, decrement member's socket count
      else {
        members[socket.username] -= 1;
        console.log('MULTIPLE SOCKETS, DECREMENTING MEMBER');
        console.log(rooms[room].members);
      }
    }
  });
  /*chat available*/
  socket.on('change room status', function(status){
    /*check is owner?*/
    /*if is*/
    var room = socket.room;
    console.log('change status!')
    io.in(socket.room).emit('change room status', status);
    rooms[socket.room].available = status;
  });
  
  socket.on('remove me from room', function(data){
    db.query("select * from user where email=?", [socket.request.session.email], function(err, result, fields){
      console.log(err);
      var dbRooms = JSON.parse(result[0].rooms);

      console.log('remove me',dbRooms);
      db.query("select * from room where id=?", [data.id], function(err, pinID, fields){
        if(dbRooms.indexOf(pinID[0].id) != -1){
          console.log("update db");
          dbRooms.splice(dbRooms.indexOf(pinID[0].id), 1);
          db.query("update user set rooms=?  where email=?",[JSON.stringify(dbRooms), socket.request.session.email]);
        }
      console.log("after: "+dbRooms);
        // if(rooms[pinID[0].pincode]){
        //   socket.broadcast.to(pinID[0].pincode).emit('user left', {
        //     username: socket.username,
        //     numUsers: rooms[room].numUsers
        //   });
        // }
      });
    });
  
  });
});


//if no username (i.e. new session), load login
//otherwise, join room and add user
function checkSession(socket, roomId, roomName, members) {
  var username = socket.request.session.username;
  var email = socket.request.session.email;
  var isAdmin = false;
  console.log(username);
  // if (!username) {
  //   //socket.emit('create virtual user');
  // } else {
  //   joinRoom(socket, roomId, roomName);
  //   addUser(socket, username);
  //   socket.emit('load chat page');
  // }
  if(rooms[roomId].admin == email){
    isAdmin = true;
  }

  data = {
    'roomId' : roomId,
    'roomName' : roomName,
    'userName' : socket.request.session.username,
    'members' : members,
    'type' : rooms[roomId].type,
    'isAdmin' : isAdmin
  }
  socket.emit('load chat page', data);
  joinRoom(socket, roomId, roomName);
  addUser(socket, username);
  // socket.to(roomId).emit('user joined', socket.request.session.username);
}


//create and add room to list, or simply join
function joinRoom(socket, roomId, roomName) {
  socket.joinedRoom = true;
  if (!rooms[roomId]) { //if room doesn't exist yet, add
    //room = new Room(roomName, roomId);
    //rooms[roomId] = room;
  }
  if(rooms[roomId].numUsers >= rooms[roomId].maximum){
    socket.emit('maximum');
  }else{

    socket.join(roomId);
    db.query("select * from user where email=?", [socket.request.session.email], function(err, result, fields){
      if(result.length == 0){

      }else{
        console.log(err);
        //var dbRooms = JSON.parse(result[0].rooms);
      var dbRooms ;
      if(checkJSON(result[0].rooms)){
        dbRooms = JSON.parse(result[0].rooms);
      }else{
        dbRooms = [];
      }

      db.query("select * from room where pincode=?", [roomId], function(err, pinID, fields){
          if(pinID.length > 0){
            console.log(pinID[0].id);
            if(dbRooms.indexOf(pinID[0].id) == -1){
              console.log("update db");
              dbRooms.push(pinID[0].id);
              db.query("update user set rooms=?  where email=?",[JSON.stringify(dbRooms), socket.request.session.email]);
            }
          }
        });
      }
    });
    //add user rooms based on session variables and newly submitted socket variables
    var sessRooms = socket.request.session.userRooms;
    if (sessRooms) {
      socket.userRooms = sessRooms;
    } else {
      var roomName = rooms[roomId].name;
      socket.userRooms = { roomName: roomId };
    }
  }
}


function addUser(socket, name) {
  var room = socket.room;
  socket.username = name;
  // socket.emit('set username', {
  //   username: socket.username
  // });

  if (!rooms[room].contains(name)) { //if user isn't already in the room
    console.log('New name, adding to room',rooms[room].numUsers);
    ++rooms[room].numUsers;

    //add a reference to the room if user has rooms and current room not on it
    var sessRooms = socket.request.session.userRooms;
    var prevRooms = socket.request.session.previousRooms;

    if (!prevRooms) {
      ++rooms[room].numReferences;
    } else if (prevRooms.indexOf(rooms[room].name) === -1) {
      ++rooms[room].numReferences;
    }

    //let everyone else know user has joined
    socket.broadcast.to(room).emit('user joined', {
      username: name,
      numUsers: rooms[room].numUsers
    });

    //for everyone else, only add new member
    socket.broadcast.to(room).emit('add user profile', {
      username: name
    });
  }

  rooms[room].addMember(name);
  console.log(rooms[room].members);
  
  displayChatHistory(socket);
  updateSidebar(socket);
}
function checkJSON(data){
  try{
    JSON.parse(data);
  }catch(e){
        console.log('json fail');
        return false;
  }
  return true;
};
function displayChatHistory(socket) {
  var chatArray = chatHistory[socket.room];
  for (var i = 0; i < chatArray.length; i++) {
    socket.emit('new message', {
      msgid: i,
      message: chatArray[i].message,
      username: chatArray[i].username,
      score: chatArray[i].score,
      userlist: chatArray[i].userlist,
      type: rooms[socket.room].type,
      time: chatArray[i].time
    });
  }
  // if (chatArray.length > 0) {
  //   socket.emit('separate messages');
  // }
}

function updateSidebar(socket) {
  var room = socket.room;

  //log user in with notification about number of participatns
  socket.emit('login', {
    numUsers: rooms[room].numUsers
  });

  for (var user in rooms[room].members) {
    socket.emit('add user profile', {
      username: user
    });
  }

  //add all user rooms to list
  for (var roomName in socket.userRooms) {
    if (roomName != 'Lobby') {
      var isCurrent = false;
      if (socket.userRooms[roomName] === socket.room) {
        isCurrent = true;
      }
      socket.emit('add room', {
        roomName: roomName,
        route: socket.userRooms[roomName],
        isCurrent: isCurrent
      });
    } else if (socket.room === 'lobby') {
      socket.emit('highlight lobby');
    }
  }
}

// function contains(list, element) {
//   return list.indexOf(element) != -1;
// }

function login(socket, info){
  console.log(info);
  console.log(info.username);
  console.log(info.password);
  db.query("SELECT * FROM user WHERE name=? AND password=?", [info.username, info.password], function (err, rows, fields) {
    if (rows.length == 0) {
      console.log("login failed");
      socket.emit('login failed', "Username or password may be wrong, please try again.");
    } else {
      socket.emit('login success');
    }
  });
}

function register(socket, info){
  console.log(info.email);
  console.log(info.username);
  console.log(info.password);
  emptyrooms = {};
  db.query("INSERT INTO user(`name`, `password`, `email`, `rooms`) VALUES(?, ?, ?, ?)", [info.email, info.password, info.name, JSON.stringify(emptyrooms)], function(err, result){
    if(!!err){}
    throw err;

    console.log(result);
    if(!err){
      socket.emit('register success');
    }else{
      socket.emit('register failed', "register failed");
    }
  });
}

function randomName(){
  var name, temp;
  temp = names.choose();
  temp = temp.split('-');
  temp[0] = capitalizeFirstLetter(temp[0]);
  temp[1] = capitalizeFirstLetter(temp[1]);
  name = temp[0] + temp[1];
  return name;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function writeToFile(name, data){
  // Check if the file exists in the current directory.
  var file = fileRoot+"/"+name+".json";
  fs.writeFileSync(file, JSON.stringify(data));
}

function rebuildRoom(socket, data){
  db.query("SELECT * FROM room WHERE id=? ", [data.id], function (err, rows, fields) {
     if (rows.length == 0) {
       console.log("room not exist!");
     } else {
       console.log("reloading room!");
       var pincode = Math.floor(Math.random()*900000)+100000;
       while(rooms[pincode] != null){
         pincode = Math.floor(Math.random()*900000)+100000;
       }
       socket.room = pincode;
       var room = new Room(rows[0].name, pincode, rows[0].type, rows[0].private, rows[0].admin, rows[0].maximum);
       chatHistory[pincode] = [];
       room.setHistory(rows[0].chathistory);
       rooms[pincode] = room;
       if(room.history != null && room.history != ""){
         console.log(rooms[pincode]);
         var chatlog = loadHistory(room.history);
         console.log(chatlog);
         for(var i = 0 ; i < chatlog.length ;i++){
           var msgObject = { msgid: i, username: chatlog[i].username, message: chatlog[i].message, score: chatlog[i].score, userlist: chatlog[i].userlist, time: chatlog[i].time};
             chatHistory[pincode].push(msgObject);
         }
       }

       console.log(rows);
       db.query("update room set pincode=?  where id=?", [pincode, data.id]);
       /*redirect*/
       socket.emit('redirect to room', {id: pincode});
     }
   });
 }

function chatHistoryExist(name){
  var file = fileRoot+"/"+name+'.json';
    fs.stat(file, function(err, stat) {
    if(err == null) {
      return true;
    } else {
      return false;
    }
  });
}

function loadHistory(name){
  var filepath = fileRoot+"/"+name+'.json';
  console.log(filepath);
  var text = fs.readFileSync(filepath,'utf8');
  return JSON.parse(text);
  
  /*fs.readFile(filepath, 'utf-8', function(err, data){
    console.log('data: ');
    console.log(data);
    console.log(err);
  });*/
  /*, function(err,data){
    if (!err) {
        console.log('received data: ' + data);
        return data;
    } else {
        console.log(err);
    }
  }*/
}
