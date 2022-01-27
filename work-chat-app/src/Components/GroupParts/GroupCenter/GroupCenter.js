import React from 'react';
import { connect } from 'react-redux';
import { Comment, List, Image } from 'semantic-ui-react';
import { setUserPosts } from '../../../Actions/Creator';
import firebase from '../../../firebase';
import GroupHeader from './GroupHeader/GroupHeader';
import GroupMessage from './GroupMessage/GroupMessage';
import GroupForm from './GroupForm/GroupForm';
import './GroupCenter.css';

class GroupCenter extends React.Component{
  state = {
    privateChannel:this.props.isPrivateChannel,
    privateMessagesRef:firebase.database().ref("privateMessages"),
    messagesRef:firebase.database().ref("messages"),
    messages:[],
    messagesLoading:true,
    channel:this.props.currentChannel,
    user:this.props.currentUser,
    usersRef:firebase.database().ref("users"),
    numUniqueUsers:"",
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
    this.messagesEnd.scrollIntoView({ behavior:"smooth" });
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
        messagesLoading:false,
      });
      this.countUniqueUsers(loadedMessages);
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
        searchLoading:true
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

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if(!acc.includes(message.user.name)){
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if(message.user.name in acc){
        acc[message.user.name].count += 1;
      }else{
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <GroupMessage
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
        <span className="groupCenter-Typing">{user.name}がメッセージを入力中...</span>
      </div>
    ));

  displayMessageSkeleton = (loading) =>
    loading ? (
      <div className="groupCenter-Start">
      <h1>メッセージがまだありません
      </h1>
    </div>
    ) : null;

    displayTopPosters = (posts) =>
        Object.entries(posts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, val], i) => (
            <List.Item key={i}>
              <div className="groupCenter-Avatar">
                <Image src={val.avatar} avatar/>
                </div>
                <List.Content>
                  <div className="groupCenter-Name">
                    <List.Header as='a'>{key}</List.Header>
                    </div>
                </List.Content>
            </List.Item>
        )).slice(0, 5);

  render(){
  
    const { messagesRef, messages, channel, user, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, typingUsers, messagesLoading } = this.state;
    const { userPosts } = this.props;

    return(
    <React.Fragment>
      <GroupHeader
        channelName={this.displayChannelName(channel)}
        numUniqueUsers={numUniqueUsers}
        handleSearchChange={this.handleSearchChange}
        searchLoading={searchLoading}
      />
      <div className="groupCenter-Member">
      {userPosts && this.displayTopPosters(userPosts)}
      </div>
      <div className="groupCenter-Area">
        <Comment.Group className='messages'>
        {this.displayMessageSkeleton(messagesLoading)}
        {searchTerm
          ? this.displayMessages(searchResults)
          : this.displayMessages(messages)}
        {this.displayTypingUsers(typingUsers)}
        <div ref={(node) => (this.messagesEnd = node)}/>
        </Comment.Group>
      </div>
      <GroupForm
        messagesRef={messagesRef}
        currentChannel={channel}
        currentUser={user}
        isPrivateChannel={privateChannel}
        getMessagesRef={this.getMessagesRef}
      />
    </React.Fragment>
    );
  }
}
export default connect(null, { setUserPosts })(GroupCenter);