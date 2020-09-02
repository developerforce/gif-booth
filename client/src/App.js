import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Create from './pages/Create';
import Home from './pages/Home';
import GroupPhoto from './pages/GroupPhoto';
import Lost from './pages/Lost';

const App = () => (
  <Switch>
    <Route exact path="/home" component={Home} />
    <Route exact path="/new-gif" component={Create} />

    <Route exact path="/group-photo" component={GroupPhoto} />
    <Route exact path="/">
      <Redirect to="/home" />
    </Route>
    <Route component={Lost} />
  </Switch>
);

export default App;
