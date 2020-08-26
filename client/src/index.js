import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Create from './pages/Create';
import Home from './pages/Home';
import GroupPhoto from './pages/GroupPhoto';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Route path='/' exact component={Home} />
    <Route path='/new-gif' component={Create} />
    <Route path='/group-photo' component={GroupPhoto} />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
