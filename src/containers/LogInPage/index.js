import React, { Component } from 'react';
import Request from '../../utils/request';
import Modal from '../../components/Modal';
import notification from '../../components/Notification';
import SignInSignUp from '../../components/SignInSignUp';
import './index.scss';

class LogIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      username: '',
      password: '',
      modal: {
        visible: false,
      },
    };
  }

  async login() {
    const { password } = this.state;
    let { email, username } = this.state;
    // Check the username value whether it's in email format
    if (/^\S+@\S+\.\S+$/.test(username)) {
      email = username;
      username = '';
    } else if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      notification(
        'Username can only consist of characters, numbers, letters, underscores',
        'warn',
      );
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(password)) {
      notification('Password can only consist of alphanumeric', 'warn');
      return;
    }
    try {
      const res = await Request.axios('post', '/api/v1/login', { email, username, password });
      if (res && res.success) {
        localStorage.setItem('userInfo', JSON.stringify(res.userInfo));
        // Popup
        this.setState({
          modal: {
            visible: true,
          },
        });
      } else {
        notification(res.message, 'error');
      }
    } catch (error) {
      notification(error, 'error');
    }
  }

  setValue = value => {
    const { username, password } = value;
    this.setState({ username, password }, async () => {
      await this.login();
    });
  };

  confirm = () => {
    this.setState({
      modal: {
        visible: true,
      },
    });
    window.location.reload();
    const originalLink = sessionStorage.getItem('originalLink');
    if (originalLink) {
      sessionStorage.removeItem('originalLink');
      window.location.href = originalLink;
      return;
    }
    window.location.href = '/';
  };

  render() {
    const { visible } = this.state.modal;
    return (
      <div className="login">
        <Modal title="Alert" visible={visible} confirm={this.confirm} hasConfirm>
          <p className="content">You have successfully logged in</p>
        </Modal>
        <SignInSignUp setValue={this.setValue} isLogin />
      </div>
    );
  }
}

export default LogIn;
