function Room(name, pincode, type, authority, admin, maximum) {
  this.name = name;
  this.id = pincode;
  this.type = type; // tradition or voting
  this.authority = authority; //private or public
  this.admin = admin;
  this.maximum = maximum;
  this.numUsers = 0;
  this.numReferences = 0;
  this.history = "";
  //name: # sockets (i.e. multiple windows open?)
  this.members = {};
  this.available = true;
}

Room.prototype.addMember = function(username) {
  if (!this.members[username]) { //if member does not exist yet
    this.members[username] = 1;
  } else { //increment count
    this.members[username] += 1;
  }
  //this.members.push(username);
}
Room.prototype.setHistory = function(name) {
  if (this.history == "") { //if this is not blank
    this.history = name;
  } 
}
Room.prototype.removeMember = function(username) {
  if (this.members[username]) {
    delete this.members[username];
  }
  // var index = this.members.indexOf(username);
  // if (index > -1) {
  //   this.members.splice(index, 1);
  // }
}

Room.prototype.contains = function(username) {
  if(username in Object.keys(this.members)){
    return true;
  }else{
    return false;
  }
  //return this.members[username] != null;
  //return (this.members.indexOf(username) != -1);
}

Room.prototype.memberList = function() {
  return Object.keys(this.members);
}

module.exports = Room;
