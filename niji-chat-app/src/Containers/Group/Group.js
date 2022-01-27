import React, { Component } from 'react';
import { connect } from 'react-redux';
import GroupTop from '../../Components/GroupParts/GroupTop/GroupTop';
import GroupLeft from '../../Components/GroupParts/GroupLeft/GroupLeft';
import GroupCenter from '../../Components/GroupParts/GroupCenter/GroupCenter';
import './Group.css';

class Group extends Component{
  render(){
    const{
      currentUser,
      currentChannel,
      isPrivateChannel,
      userPosts
    } = this.props;

    return(
    <div className="group-Page">
        <div className="group-Menu">
            <div className="group-Bar">
                <div className="group-Logo">
                    NijiChat
                </div>
                <GroupTop
                currentUser={currentUser}
                />
            </div>
        </div>
        <div className="group-Left">
            <GroupLeft
              key={currentUser && currentUser.uid}
              currentUser={currentUser}
            />
        </div>
        <div className="group-Center">
            <GroupCenter
              key={currentChannel && currentChannel.id}
              currentChannel={currentChannel}
              currentUser={currentUser}
              isPrivateChannel={isPrivateChannel}
              userPosts={userPosts}
            />
        </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser:state.user.currentUser,
  currentChannel:state.channel.currentChannel,
  isPrivateChannel:state.channel.isPrivateChannel,
  userPosts:state.channel.userPosts
});
export default connect(mapStateToProps)(Group);