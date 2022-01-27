import React from 'react';
import { connect } from 'react-redux';
import { Menu, Icon, Modal, Form, Input, Button, Label, Image } from 'semantic-ui-react';
import AddBoxIcon from '@material-ui/icons/AddBox';
import firebase from '../../../../firebase';
import { setCurrentChannel, setPrivateChannel } from '../../../../Actions/Creator';
import './GroupChat.css';

class GroupChat extends React.Component{
  state = {
    activeChannel:"",
    user:this.props.currentUser,
    channel:null,
    channels:[],
    channelName:"",
    channelDetails:"",
    channelsRef:firebase.database().ref("group"),
    messagesRef:firebase.database().ref("messages"),
    typingRef:firebase.database().ref("typing"),
    notifications:[],
    modal:false,
    firstLoad:true
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({ channels:loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      if(this.state.channel){
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );

    if(index !== -1){
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;
        if(snap.numChildren() - lastTotal > 0){
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    }else{
      notifications.push({
        id:channelId,
        total:snap.numChildren(),
        lastKnownTotal:snap.numChildren(),
        count:0
      });
    }
    this.setState({ notifications });
  };

  removeListeners = () => {
    this.state.channelsRef.off();
    this.state.channels.forEach((channel) => {
      this.state.messagesRef.child(channel.id).off();
    });
  };

  setFirstChannel = () => {
    
    const firstChannel = this.state.channels[0];

    if(this.state.firstLoad && this.state.channels.length > 0){
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel:firstChannel });
    }
    this.setState({ firstLoad:false });
  };

  addChannel = () => {

    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id:key,
      name:channelName,
      details:channelDetails,
      createdBy:{
        name:user.displayName,
        avatar:user.photoURL
      }
    };

    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
        console.log("channel added");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if(this.isFormValid(this.state)){
      this.addChannel();
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  changeChannel = (channel) => {
    this.setActiveChannel(channel);
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    this.clearNotifications();
    this.props.setCurrentChannel(channel);
    this.props.setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    if(index !== -1){
      let updatedNotifications = [...this.state.notifications];
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      updatedNotifications[index].count = 0;
      this.setState({ notifications:updatedNotifications });
    }
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel:channel.id });
  };

  getNotificationCount = (channel) => {
    let count = 0;
    this.state.notifications.forEach((notification) => {
      if(notification.id === channel.id){
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={()=>this.changeChannel(channel)}
        name={channel.name}
        className={
          channel.id === this.state.activeChannel
            ? "active inactive flex_between"
            : "inactive flex_between"
        }>
        <Image className="groupList-Avatar" src={channel && channel.createdBy.avatar} />
        <div className="groupList-Lines">
          <div className="groupList-Line">
            <div className="groupList-Name"><Icon name='code'/>{channel.name}</div>
            <div className="groupList-Count">
              {this.getNotificationCount(channel) && (
              <Label color='red' size='small'>
              {this.getNotificationCount(channel)}
              </Label>
              )}
            </div>
          </div>
          <div className="groupList-Details">
            <p>{channel && channel.details}</p>
          </div>
        </div>
      </Menu.Item>
    ));

  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render(){

    const { channels, modal } = this.state;

    return(
    <div>
      <div className="groupList-Header">
        <div className="groupList-HeaderItem">
          <h1>Group({channels.length})</h1>
        </div>
      <div className="groupList-HeaderIcon"> 
          <AddBoxIcon fontSize="large" onClick={this.openModal}/>
      </div>
    </div>
    <div className="groupList-Item">
      {this.displayChannels(channels)}
    </div>
    <Modal
      basic
      open={modal}
      onClose={this.closeModal}
      style={{ background: "#3f3e3e", borderRadius: 10 }}>
      <Modal.Header style={{ color: "#2efa94", fontSize: 20 }}>
        Create Group
      </Modal.Header>
      <Modal.Content>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label style={{ color:"#31f8ff", fontSize: 18, opacity: 0.8 }}>
              Group Name
            </label>
            <Input
              fluid
              name='channelName'
              onChange={this.handleChange}
              size='huge'
              placeholder='グループ名'
            />
          </Form.Field>
          <Form.Field>
            <label style={{ color:"#31f8ff", fontSize: 18, opacity: 0.8 }}>
              Group Details
            </label>
            <Input
              fluid
              name='channelDetails'
              onChange={this.handleChange}
              size='huge'
              placeholder='グループ概要'
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color='green' inverted onClick={this.handleSubmit}>
          <p>
            <Icon name='code'/>
            作成
          </p>
        </Button>
        <Button color='red' inverted onClick={this.closeModal}>
          <Icon name='remove'/>キャンセル
        </Button>
      </Modal.Actions>
    </Modal>
    </div>
    );
  }
}
export default connect(null, { setCurrentChannel, setPrivateChannel })(GroupChat);