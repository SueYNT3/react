import React, { Component } from 'react';
import { Grid, Header, Icon, Message, Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import './Register.css';

export default class Login extends Component{
  state = {
    username:"",
    email:"",
    password:"",
    passwordConfirmation:"",
    errors:[],
    loading:false,
    usersRef:firebase.database().ref("users")
  };

  isFormValid = () => {

    let errors = [];
    let error;

    if(this.isFormEmpty(this.state)){
      error = { message:"空白の欄があります!" };
      this.setState({ errors:errors.concat(error) });
      return false;
    }else if(!this.isPasswordValid(this.state)){
      error = { message:"パスワードが一致しません!" };
      this.setState({ errors: errors.concat(error) });
      return false;
    }else{
      return true;
    }
  };

  isFormEmpty = ({ username, email, password, passwordConfirmation }) => {
    return(
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  isPasswordValid = ({ password, passwordConfirmation }) => {
    if(password.length < 6 || passwordConfirmation.length < 6){
      return false;
    }else if(password !== passwordConfirmation){
      return false;
    }else{
      return true;
    }
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if(this.isFormValid()){
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then((createdUser) => {
          console.log(createdUser);
          createdUser.user
            .updateProfile({
              displayName:this.state.username,
              photoURL:'https://static.wixstatic.com/media/4c40ae_678ad45118714550add24406c2257a4a~mv2.png/v1/fill/w_500,h_400,al_c,q_85,usm_0.66_1.00_0.01/avatar1.webp'
            })
            .then(() => {
              this.saveUser(createdUser).then(() => {
                console.log("user saved");
              });
            })
            .catch((err) => {
              console.error(err);
              this.setState({
                errors:this.state.errors.concat(err),
                loading:false,
              });
            });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            errors:this.state.errors.concat(err),
            loading:false,
          });
        });
    }
  };

  saveUser = (createdUser) => {
    return this.state.usersRef.child(createdUser.user.uid).set({
      name:createdUser.user.displayName,
      avatar:createdUser.user.photoURL
    });
  };

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render(){

    const{
      username,
      email,
      password,
      passwordConfirmation,
      errors,
      loading
    } = this.state;

    return(
    <Grid verticalAlign="middle" textAlign="center" className="register-Form">
      <Grid.Row columns={2}>
        <Grid.Column style={{ maxWidth: "500px" }}>
          <Header icon as="h1" style={{ color:"#74ee55" }}>
            <Icon name="wechat"/>
            Register
          </Header>
          <p>
            <span style={{ fontSize: 18, color:"#f1e640" }}>
              アカウントがある方はこちら→{" "}
            </span>
            <span style={{ fontSize: 18 }}>
              <Link to='/'>Login</Link>
            </span>
          </p>
          {errors.length > 0 && (
          <Message error>{this.displayErrors(errors)}</Message>
          )}
          <Form onSubmit={this.handleSubmit}>
            <Form.Input
              fluid
              name='username'
              icon='user'
              iconPosition='right'
              placeholder='Username'
              onChange={this.handleChange}
              value={username}
              type='text'
              size='huge'
            />
            <Form.Input
              fluid
              name='email'
              icon='mail'
              iconPosition='right'
              placeholder='Email'
              onChange={this.handleChange}
              value={email}
              className={this.handleInputError(errors, "email")}
              type='email'
              size='huge'
            />
            <Form.Input
              fluid
              name='password'
              icon='lock'
              iconPosition='right'
              placeholder='Password'
              onChange={this.handleChange}
              value={password}
              className={this.handleInputError(errors, "password")}
              type='password'
              size='huge'
            />
            <Form.Input
              fluid
              name='passwordConfirmation'
              icon='lock'
              iconPosition='right'
              placeholder='Confirm Password'
              onChange={this.handleChange}
              value={passwordConfirmation}
              className={this.handleInputError(errors, "password")}
              type='password'
              size='huge'
            />
            <Button
              disabled={loading}
              primary
              className={loading ? "loading" : ""}
              fluid
              size='huge'>
                Create an account
            </Button>
            <div style={{ marginTop: 10 }}></div>
          </Form>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    );
  }
}