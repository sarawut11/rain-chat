/* eslint-disable no-sequences */
import axios from 'axios';
import { notification } from 'antd';

export default class Request {
  static apiUrl = 'https://vitaerain.chat';

  static axiosConfigInit() {
    axios.defaults.baseURL = this.apiUrl;
  }

  static async axios(method = 'get', url, params) {
    // console.log('request', url);
    const handleMethod = method === 'get' && params ? { params } : params;

    const user_info = JSON.parse(localStorage.getItem('userInfo'));
    let token = '';

    if (user_info) {
      token = user_info.token;
    }

    if (token && token.length > 0 && !url.includes('login') && !url.includes('register')) {
      axios.defaults.headers.Authorization = `Bearer ${token}`;
    }

    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-expressions
      axios[method](url, handleMethod)
        .then(res => {
          const response = typeof res.data === 'object' ? res.data : JSON.parse(res.data);
          resolve(response);
        })
        .catch(error => {
          // console.log('request error', error, error.response);
          notification.error({
            message: 'Internal server error.',
          });
          if (error.response.status === 401) {
            window.socket.disconnect();
            localStorage.removeItem('userInfo');
            notification.error('Token expired or unauthorized.');
            window.location.href = '/login';
          } else {
            reject(error.response ? error.response.data : error);
          }
        });
    });
  }

  static socketEmit(emitName, data, onError) {
    try {
      window.socket.emit(emitName, data);
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }

  static socketEmitAndGetResponse(emitName, data, onError) {
    return new Promise((resolve, reject) => {
      try {
        // console.log('socketEmitAndGetResponse:\n', data);
        window.socket.emit(emitName, data, response => {
          resolve(response);
        });
      } catch (error) {
        if (onError) {
          onError(error);
        }
        reject(error);
      }
    });
  }
}
