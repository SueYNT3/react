import React from 'react';
import { connect } from 'react-redux';
import {  Icon, Image } from 'semantic-ui-react';
import firebase from '../../../../firebase';
import { setCurrentChannel, setPrivateChannel } from '../../../../Actions/Creator';
import './PrivateChat.css';


class PrivateChat extends React.Component{
  state = {
    activeChannel:"",
    user:this.props.currentUser,
    users:[],  
    usersRef:firebase.database().ref("users"),
    connectedRef:firebase.database().ref(".info/connected"),
    onlineRef:firebase.database().ref("online")
  };

  componentDidMount(){
    if(this.state.user){
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  removeListeners = () => {
    this.state.usersRef.off();
    this.state.onlineRef.off();
    this.state.connectedRef.off();
  };

  addListeners = (currentUserUid) => {

    let loadedUsers = [];

    this.state.usersRef.orderByChild("timestamp").on("child_added", (snap) => {
      if(currentUserUid !== snap.key){
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        loadedUsers.reverse();
        this.setState({ users:loadedUsers });
        console.log(snap);
      }
    });

    this.state.connectedRef.on("value", (snap) => {
      if(snap.val() === true){
        const ref = this.state.onlineRef.child(currentUserUid);
        ref.set(true);
        ref.onDisconnect().remove((err) => {
          if(err !== null){
            console.error(err);
          }
        });
      }
    });

    this.state.onlineRef.on("child_added", (snap) => {
      if(currentUserUid !== snap.key){
        this.addStatusToUser(snap.key);
      }
    });

    this.state.onlineRef.on("child_removed", (snap) => {
      if(currentUserUid !== snap.key){
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  addStatusToUser = (userId, connected = true) => {
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if(user.uid === userId){
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    this.setState({ users:updatedUsers });
  };

  isUserOnline = (user) => user.status === "online";

  changeChannel = (user) => {

    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name
    };

    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  getChannelId = (userId) => {

    const currentUserId = this.state.user.uid;
    
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  render(){

    const { users, activeChannel } = this.state;

    return(
    <div>
      <div className="privateChat-Users">
        <div className="privateChat-Item">
          <h1>User({users.length})</h1>
        </div>
      </div>
      {users.length > 0 &&
        users.map((user) => (
        <div 
          key={user.uid}
          onClick={() => this.changeChannel(user)}
          className={
          user.uid === activeChannel
            ? "active inactive flex_between"
            : "inactive flex_between"
            }>
            <Image className="privateChat-Avatar" src={user.avatar}/>
          <div className="privateChat-Lines">
            <div className="privateChat-Line">
              <div className="privateChat-Name">{user.name}</div>
                <Icon
                  size='small'
                  name='circle'
                  color={this.isUserOnline(user) ? "green" : "red"}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
    );
  }
}
export default connect(null, { setCurrentChannel, setPrivateChannel })(PrivateChat);