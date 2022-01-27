import React from 'react';
import GroupChat from './GroupChat/GroupChat';
import './GroupLeft.css';

class GroupLeft extends React.Component{
    render(){

        const { currentUser } = this.props;
        
        return(
        <div className="groupLeft-Item">
            <GroupChat currentUser={currentUser}/>
        </div>
        );
    }
}
export default GroupLeft;