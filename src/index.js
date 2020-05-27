import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './router';
import AxiosHandle from './utils/request';
import 'antd/dist/antd.css';
import './index.scss';

if (window.location.protocol === 'https:' && navigator.serviceWorker) {
  window.addEventListener('load', () => {
    const sw = '/service-worker.js';
    navigator.serviceWorker.register(sw);
  });
}
console.log(process.env.NODE_ENV);

ReactDom.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);

AxiosHandle.axiosConfigInit();
