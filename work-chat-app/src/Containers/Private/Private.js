import React, { Component } from 'react';
import { connect } from 'react-redux';
import PrivateTop from '../../Components/PrivateParts/PrivateTop/PrivateTop';
import PrivateLeft from '../../Components/PrivateParts/PrivateLeft/PrivateLeft';
import PrivateCenter from '../../Components/PrivateParts/PrivateCenter/PrivateCenter';
import './Private.css';

class Private extends Component{
    render(){
        
        const{
            currentUser,
            currentChannel,
            isPrivateChannel
        } = this.props;
        
        return(
        <div className="private-Home">
            <div className="private-Page">
                <div className="private-Bar">
                    <div className="private-Logo">
                        WorkChat
                    </div>
                    <PrivateTop
                    currentUser={currentUser}
                    />
                </div>
            </div>
            <div className="private-Left">
                <PrivateLeft
                key={currentUser && currentUser.uid}
                currentUser={currentUser}
                />
            </div>
            <div className="private-Center">
                <PrivateCenter
                key={currentChannel && currentChannel.id}
                currentChannel={currentChannel}
                currentUser={currentUser}
                isPrivateChannel={isPrivateChannel}
              />
            </div>
        </div>
        );
    }
}

const mapStateToProps = (state) => ({
  currentUser:state.user.currentUser,
  currentChannel:state.channel.currentChannel,
  isPrivateChannel:state.channel.isPrivateChannel
});

export default connect(mapStateToProps)(Private);