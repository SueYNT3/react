import React from 'react';
import ReactDOM from 'react-dom';
import Register from './Containers/Register/Register';
import Login from './Containers/Login/Login';
import Private from './Containers/Private/Private';
import Group from './Containers/Group/Group';
import Loading from './Loading';
import firebase from './firebase';
import 'semantic-ui-css/semantic.min.css';
import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './Actions/reducer';
import { setUser, clearUser } from './Actions/Creator';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component{
  componentDidMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if(user){
        this.props.setUser(user);
        this.props.history.push("/private");
      }else{
        this.props.history.push("/");
        this.props.clearUser();
      }
    });
  }

  render(){
    return this.props.isLoading ? (
      <Loading/>
    ) : (
      <Switch>
        <Route exact path='/' component={Login}/>
        <Route path='/register' component={Register}/>
        <Route path='/private' component={Private}/>
        <Route path='/group' component={Group}/>
      </Switch>
    );
  }
}

const mapStateFromProps = (state) => ({
  isLoading: state.user.isLoading,
});

const RootWithAuth = withRouter(
  connect(mapStateFromProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);