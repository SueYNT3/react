import React from 'react';
import { withRouter } from 'react-router-dom';
import firebase from '../../../firebase';
import AvatarEditor from 'react-avatar-editor';
import { Grid, Header, Icon, Image, Modal, Input, Button } from 'semantic-ui-react';
import ChatIcon from '@material-ui/icons/Chat';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import './PrivateTop.css';

class privateTop extends React.Component{
  state = {
    user:this.props.currentUser,
    modal:false,
    previewImage:"",
    croppedImage:"",
    blob:null,
    uploadedCroppedImage:"",
    storageRef:firebase.storage().ref(),
    userRef:firebase.auth().currentUser,
    usersRef:firebase.database().ref("users"),
    metadata:{
      contentType:"image/jpeg",
    }
  };

  openModal = () => this.setState({ modal:true });

  closeModal = () => this.setState({ modal:false });

  uploadCroppedImage = () => {

    const { storageRef, userRef, blob, metadata } = this.state;

    storageRef
      .child(`avatars/users/${userRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((downloadURL) => {
          this.setState({ uploadedCroppedImage:downloadURL }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    this.state.userRef
      .updateProfile({
        photoURL:this.state.uploadedCroppedImage
      })
      .then(() => {
        console.log("PhotoURL updated");
        this.closeModal();
      })
      .catch((err) => {
        console.error(err);
      });

    this.state.usersRef
      .child(this.state.user.uid)
      .update({ avatar:this.state.uploadedCroppedImage })
      .then(() => {
        console.log("User avatar updated");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleChange = (event) => {

    const file = event.target.files[0];
    const reader = new FileReader();

    if(file){
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage:reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);
        this.setState({
          croppedImage:imageUrl,
          blob
        });
      });
    }
  };

  handlePageChange = () => {

    const { history } = this.props;
    
    if(history) history.push('/group');
   };

  handleSignout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => console.log("signed out!"));
  };

  render(){

    const { user, modal, previewImage, croppedImage } = this.state;

    return(
    <Grid.Column>
      <Header as='h1' inverted style={{ display:"flex", flexDirection:"row" }}>
        <div className="privateTop-Profile">
          <span style={{ color:"#1d8eff"}}>
            <Image className="privateTop-Avatar" src={user.photoURL} avatar onClick={this.openModal}/>
            - {user.displayName} -
          </span>
        </div>
      </Header>
      <ChatIcon className="privateTop-Change"
        fontSize="large" 
        style={{color:'#FFFFFF'}}
        onClick={this.handlePageChange}
      />
      <ExitToAppIcon className="privateTop-Logout"
        fontSize="large" 
        style={{color:'#FFFFFF'}}
        onClick={this.handleSignout}
      />
      <Modal basic open={modal} onClose={this.closeModal}>
        <Modal.Header>アイコンの変更</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.handleChange}
            fluid
            type='file'
            label='New Icon'
            name='previewImage'
          />
          <Grid centered stackable columns={2}>
            <Grid.Row centered>
              <Grid.Column>
                {previewImage && (
                <AvatarEditor
                  ref={(node) => (this.avatarEditor = node)}
                  image={previewImage}
                  width={120}
                  height={120}
                  border={50}
                  scale={1.2}
                />
                )}
              </Grid.Column>
              <Grid.Column>
                {croppedImage && (
                <Image
                  style={{ margin:"3.5em auto" }}
                  width={100}
                  height={100}
                  src={croppedImage}
                />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          {croppedImage && (
          <Button
            color='green'
            inverted
            onClick={this.uploadCroppedImage}>
              <Icon name='save'/>変更
          </Button>
          )}
          <Button color='green' inverted onClick={this.handleCropImage}>
            <Icon name='image'/>Preview
          </Button>
          <Button color='red' inverted onClick={this.closeModal}>
            <Icon name='remove'/>Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </Grid.Column>
    );
  }
}
export default withRouter(privateTop);