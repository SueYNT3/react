import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import firebase from '../../../../firebase';
import CloseIcon from '@material-ui/icons/Close';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import ImageIcon from '@material-ui/icons/Image';
import SendIcon from '@material-ui/icons/Send';
import MicIcon from '@material-ui/icons/Mic';
import PrivateUpload from '../PrivateUpload/PrivateUpload';
import PrivatePercent from '../PrivatePercent/PrivatePercent';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import './PrivateForm.css';

class PrivateForm extends React.Component{
  state = {
    storageRef:firebase.storage().ref(),
    typingRef:firebase.database().ref("typing"),
    usersRef:firebase.database().ref("users"),
    uploadTask:null,
    uploadState:"",
    percentUploaded:0,
    message:"",
    channel:this.props.currentChannel,
    user:this.props.currentUser,
    loading:false,
    errors:[],
    modal:false,
    emojiPicker:false,
    listening:false
  };

  componentWillUnmount() {
    if(this.state.uploadTask !== null){
      this.state.uploadTask.cancel();
      this.setState({ uploadTask:null });
    }
  }

  openModal = () => this.setState({ modal:true });

  closeModal = () => this.setState({ modal:false });

  handleChange = (event) => {
    this.setState({ [event.target.name]:event.target.value });
  };

  handleKeyDown = (event) => {
    if(event.keyCode === 13){
      this.sendMessage();
    }

    const { message, typingRef, channel, user } = this.state;

    if(message){
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    }
    else{
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  handleTogglePicker = () => {
    this.setState({ emojiPicker:!this.state.emojiPicker });
  };

  handleCloseEmoji = () => {
    this.setState({ emojiPicker:false });
  };

  handleAddEmoji = (emoji) => {

    const oldMessage = this.state.message;
    const newMessage = (`${oldMessage}  ${emoji.native}`);
    
    this.setState({ message:newMessage, emojiPicker:false });
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp:firebase.database.ServerValue.TIMESTAMP,
      user:{
        id:this.state.user.uid,
        name:this.state.user.displayName,
        avatar:this.state.user.photoURL
      },
    };
    if(fileUrl !== null){
      message["image"] = fileUrl;
    }else{
      message["content"] = this.state.message;
    }
    return message;
  };

  sendMessage = () => {
    
    const { getMessagesRef } = this.props;
    const { message, channel, user, typingRef, usersRef} = this.state;

    if(message){
      this.setState({ loading:true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading:false, message:"", errors:[] });
          typingRef.child(channel.id).child(user.uid).remove();
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading:false,
            errors:this.state.errors.concat(err)
          });
        });
    }
    if(message){
      const date = {
        name:this.state.user.displayName,
        avatar:this.state.user.photoURL,
        timestamp:firebase.database.ServerValue.TIMESTAMP
      }
      this.setState({ loading:true });
      usersRef
        .child(user.uid)
        .update(date)
        .then(() => {
          this.setState({ loading:false, message:"", errors:[] });
          typingRef.child(channel.id).child(user.uid).remove();
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            loading:false,
            errors:this.state.errors.concat(err),
          });
        });
    } 
    else{
      this.setState({
        errors:this.state.errors.concat({ message:"Add a message" }),
      });
    }
  };

  getPath = () => {
    if(this.props.isPrivateChannel){
      return `chat/private/${this.state.channel.id}`;
    }else{
      return "chat/public";
    }
  };

  uploadFile = (file, metadata) => {

    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState:"uploading",
        uploadTask:this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            this.setState({ percentUploaded });
          },
          (err) => {
            console.error(err);
            this.setState({
              errors:this.state.errors.concat(err),
              uploadState:"error",
              uploadTask:null
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch((err) => {
                console.error(err);
                this.setState({
                  errors:this.state.errors.concat(err),
                  uploadState:"error",
                  uploadTask:null
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState:"done" });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          errors:this.state.errors.concat(err),
        });
      });
  };

  handleMicClick = () =>{
  let recognition =null;
    let SpeechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
    if(SpeechRecognition !== undefined){
        recognition = new SpeechRecognition();
    }
    if(recognition !== null){
      recognition.onstart = () => {
        this.setState({ listening: true });
      }
      recognition.onend = () => {
        this.setState({ listening: false });
      }
      recognition.onresult = (event) => {
          this.setState({message: event.results[0][0].transcript});
      }
      recognition.start();
    }
  };
 
  render(){

    const { message, loading, modal, uploadState, percentUploaded, emojiPicker, listening } = this.state;

    return(
    <div>
      {emojiPicker && (
      <Picker
        set='apple'
        theme='dark'
        onSelect={this.handleAddEmoji}
        className='emojipicker'
        title='絵文字を選択'
        emoji='point_up'
        style={{ width: "100%" }}
      />
      )}
      <div className="privateForm-Footer">
        <div className="privateForm-Pre">
          <div className="privateForm-Btns" onClick={this.handleCloseEmoji}
          style={{ width:emojiPicker?40:0 }}>
            <CloseIcon style={{color:'#919191'}}/>
          </div>
          <div className="privateForm-Btns" onClick={this.handleTogglePicker}>
            <InsertEmoticonIcon style={{color:emojiPicker?'#009688':'#919191'}}/>
          </div>
          <div className="privateForm-Btns" disabled={uploadState === "uploading"} onClick={this.openModal}>
            <ImageIcon style={{color:'#919191'}}/>
          </div>
        </div>
        <div className="privateForm-InputArea">
          <input className="privateForm-Input"
            type="text"
            name='message'
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            value={message}
            ref={(node) => (this.messageInputRef = node)}
            placeholder='メッセージを入力...'
          />
        </div>
        <div className="privateForm-Pos">
        {message === '' &&
        <div className="privateForm-Btns" onClick={this.handleMicClick}>
          <MicIcon style={{ color:listening?'#126ECE':'#919191' }}/>
        </div>
        }
        {message !== '' &&
        <div className="privateForm-Btns" onClick={this.sendMessage} disabled={loading}>
          <SendIcon style={{color:'#919191'}}/>
        </div>
        }
      </div>
    </div>
    <PrivateUpload
      modal={modal}
      closeModal={this.closeModal}
      uploadFile={this.uploadFile}
    />
    <PrivatePercent
      uploadState={uploadState}
      percentUploaded={percentUploaded}
    />
  </div>
  );
}
}
export default PrivateForm;