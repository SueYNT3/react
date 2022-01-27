import React, { Component } from 'react';
import { Grid, Header, Icon, Message, Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import './Login.css';

export default class Login extends Component{
  state = {
    email:"",
    password:"",
    errors:[],
    loading:false
  };

  displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if(this.isFormValid(this.state)){
      this.setState({ errors: [], loading: true });
      firebase
        .auth()
        .signInWithEmailAndPassword(this.state.email, this.state.password)
        .then((signedInUser) => {
          console.log(signedInUser);
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

  isFormValid = ({ email, password }) => email && password;

  handleInputError = (errors, inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  render(){
    
    const { email, password, errors, loading } = this.state;

    return(
    <Grid verticalAlign="middle" textAlign="center" className="login-Form">
      <Grid.Row columns={2}>
        <Grid.Column style={{ maxWidth: '500px' }}>
          <Header icon as="h1" style={{color:'#62a8ee'}}>
            <Icon name="wechat"/>
            Login
          </Header>
          <p>
            <span style={{ fontSize: 18, color:'#f1e640' }}>
              アカウントの登録はこちら→{" "}
            </span>
            <span style={{ fontSize: 18 }}>
              <Link to='./register'>Register</Link>
            </span>
          </p>
          {errors.length > 0 && (
          <Message error>{this.displayErrors(errors)}</Message>
          )}
          <Form onSubmit={this.handleSubmit}>
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
            <Button
              disabled={loading}
              primary
              className={loading ? "loading" : ""}
              fluid
              size='huge'>
                Login
            </Button>
            <div style={{ marginTop: 10 }}></div>
          </Form>
        </Grid.Column>
      </Grid.Row>
    </Grid>
    );
  }
}