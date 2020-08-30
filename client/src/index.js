import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Create from './pages/Create';
import Home from './pages/Home';
import GroupPhoto from './pages/GroupPhoto';
import Lost from './pages/Lost';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Route exact path="/home" component={Home} />
    <Route exact path="/new-gif" component={Create} />
    <Route exact path="/group-photo" component={GroupPhoto} />
    <Route exact path="/">
      <Redirect to="/home" />
    </Route>
    <Route component={Lost} />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
