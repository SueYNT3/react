import React from 'react';
import moment from 'moment';
import './PrivateMessage.css';

const timeNow = (timestamp) => moment(timestamp).format("YYYY-MM-DD HH:mm");

const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const PrivateMessage = ({ message, user }) => (

<div className="privateMessage-Line" style={{ justifyContent:message.user.id ===user.uid ? 'flex-end':'flex-start' }}>
  <img className="privateMessage-Avatar" src={message.user.avatar} alt=""/>
  <div className="privateMessage-Item" style={{ backgroundColor:message.user.id ===user.uid ? '#59d381':'rgb(171, 206, 204)' }}>
    {isImage(message) ? (
    <img className="privateMessage-Text" src={message.image} alt=""/>
    ) : (
    <div className="privateMessage-Text">{message.content}</div>
    )}
    <div className="privateMessage-Date">{timeNow(message.timestamp)}</div>
  </div>
</div>
);
export default PrivateMessage;