import React from 'react';
import { connect } from 'react-redux';
import { Comment } from 'semantic-ui-react';
import { setUserPosts } from '../../../Actions/Creator';
import firebase from '../../../firebase';
import PrivateHeader from './PrivateHeader/PrivateHeader';
import PrivateMessage from './PrivateMessage/PrivateMessage';
import PrivateForm from './PrivateForm/PrivateForm';
import PrivateScreen from './PrivateScreen/PrivateScreen';
import './PrivateCenter.css';

class PrivateCenter extends React.Component{
  state = {
    privateChannel:this.props.isPrivateChannel,
    privateMessagesRef:firebase.database().ref("privateMessages"),
    messagesRef:firebase.database().ref("messages"),
    messages:[],
    messagesLoading:true,
    channel:this.props.currentChannel,
    user:this.props.currentUser,
    usersRef:firebase.database().ref("users"),
    searchTerm:"",
    searchLoading:false,
    searchResults:[],
    typingRef:firebase.database().ref("typing"),
    typingUsers:[],
    connectedRef:firebase.database().ref(".info/connected"),
    listeners:[]
  };

  componentDidMount() {

    const { channel, user, listeners } = this.state;

    if(channel && user){
      this.removeListeners(listeners);
      this.addListeners(channel.id);
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  componentDidUpdate(prevProps, prevState) {
    if(this.messagesEnd){
      this.scrollToBottom();
    }
  }

  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return(
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if(index === -1){
      const newListener = { id, ref, event };
      this.setState({ listeners:this.state.listeners.concat(newListener) });
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  };

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
    this.addTypingListeners(channelId);
  };

  addTypingListeners = (channelId) => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", (snap) => {
      if(snap.key !== this.state.user.uid){
        typingUsers = typingUsers.concat({
          id:snap.key,
          name:snap.val()
        });
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_added");

    this.state.typingRef.child(channelId).on("child_removed", (snap) => {
      const index = typingUsers.findIndex((user) => user.id === snap.key);
      if(index !== -1){
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    });
    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    this.state.connectedRef.on("value", (snap) => {
      if(snap.val() === true){
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove((err) => {
            if(err !== null){
              console.error(err);
            }
          });
      }
    });
  };

  addMessageListener = (channelId) => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", (snap) => {
      loadedMessages.push(snap.val());
      this.setState({
        messages:loadedMessages,
        messagesLoading:false
      });
      this.countUserPosts(loadedMessages);
    });
    this.addToListeners(channelId, ref, "child_added");
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm:event.target.value,
        searchLoading:true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if(
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ){
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading:false }), 1000);
  };


  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if(message.user.name in acc) {
        acc[message.user.name].count += 1;
      }else{
        acc[message.user.name] = {
          avatar:message.user.avatar,
          count:1
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  displayMessages = (messages) =>
  messages.length > 0 &&
  messages.map((message) => (
    <PrivateMessage
      key={message.timestamp}
      message={message}
      user={this.state.user}
    />
  ));

  displayChannelName = (channel) => {
    return channel
      ?`${channel.name}`
      : "?????";
  };

  displayTypingUsers = (users) =>
    users.length > 0 &&
    users.map((user) => (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "0.2em" }}
        key={user.id}>
        <span className='privateCenter_Typing'>{user.name}がメッセージを入力中...</span>
      </div>
    ));

  displayMessageSkeleton = (loading) =>
    loading ? (
    <div className="privateCenter-Start">
      <h1>メッセージがまだありません
      </h1>
    </div>
    ) : null;

  render(){

    const { messagesRef, messages, channel, user, searchTerm, searchResults, searchLoading, privateChannel, typingUsers, messagesLoading } = this.state;

    return(
    <React.Fragment>
      {channel === null &&
      <PrivateScreen/>
      }
      {channel !== null &&
      <PrivateHeader
        channelName={this.displayChannelName(channel)}
        handleSearchChange={this.handleSearchChange}
        searchLoading={searchLoading}
        isPrivateChannel={privateChannel}
      />
      }
      <div className="privateCenter-Area">
        {channel !== null &&
        <Comment.Group className='messages'>
          {this.displayMessageSkeleton(messagesLoading)}
          {searchTerm
            ? this.displayMessages(searchResults)
            : this.displayMessages(messages)}
          {this.displayTypingUsers(typingUsers)}
          <div ref={(node) => (this.messagesEnd = node)}/>
        </Comment.Group>
        }
      </div>
      {channel !== null &&
      <PrivateForm
        messagesRef={messagesRef}
        currentChannel={channel}
        currentUser={user}
        isPrivateChannel={privateChannel}
        getMessagesRef={this.getMessagesRef}
      />
      }
    </React.Fragment>
    );
  }
}
export default connect(null, { setUserPosts })(PrivateCenter);