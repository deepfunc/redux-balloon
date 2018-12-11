import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import biz from './biz';
import Index from '@/components/Index';

const App = () => (
  <Provider store={biz.store}>
    <Router>
      <Switch>
        <Route path="/" component={Index}/>
      </Switch>
    </Router>
  </Provider>
);

setTimeout(() => {
  ReactDOM.render(<App/>, document.getElementById('app'));
}, 100);
