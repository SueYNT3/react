import React from 'react';
import moment from 'moment';
import './GroupMessage.css';

const timeNow = (timestamp) => moment(timestamp).format("YYYY-MM-DD HH:mm");

const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

const GroupMessage = ({ message, user }) => (

<div className="groupMessage-Line" style={{ justifyContent:message.user.id ===user.uid ? 'flex-end':'flex-start' }}>
  <img className="groupMessage-Avatar" src={message.user.avatar} alt=""/>
  <div className="groupMessage-Item" style={{ backgroundColor:message.user.id ===user.uid ? '#59d381':'rgb(171, 206, 204)' }}>
    {isImage(message) ? (
    <img className="groupMessage-Text" src={message.image} alt=""/>
    ) : (
    <div className="groupMessage-Text">{message.content}</div>
    )}
    <div className="groupMessage-Date">{timeNow(message.timestamp)}</div>
  </div>
</div>
);
export default GroupMessage;