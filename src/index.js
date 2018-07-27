import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import runtimeCaching from './runtimeCaching';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
runtimeCaching();
