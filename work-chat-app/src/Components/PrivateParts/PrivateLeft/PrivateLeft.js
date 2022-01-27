import React from 'react';
import PrivateChat from './PrivateChat/PrivateChat';
import './PrivateLeft.css';

class PrivateLeft extends React.Component{
  render(){

    const { currentUser } = this.props;
    
    return(
    <div className="privateLeft-Area">
      <PrivateChat currentUser={currentUser}/>
    </div>
    );
  }
}
export default PrivateLeft;