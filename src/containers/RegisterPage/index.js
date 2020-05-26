import React, { Component } from 'react';
import './index.scss';
import Request from '../../utils/request';
import Modal from '../../components/Modal';
import notification from '../../components/Notification';
import SignInSignUp from '../../components/SignInSignUp';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      modal: {
        visible: false,
      },
    };
  }

  register = async () => {
    const { username, password } = this.state;
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      notification('Username can only consist of numbers, letters, underscores', 'warn');
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(password)) {
      notification('Password can only consist of alphanumeric', 'warn');
      return;
    }
    try {
      const res = await Request.axios('post', '/api/v1/register', {
        username,
        password,
      });
      if (res && res.success) {
        // 弹窗
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
  };

  setValue = value => {
    const { username, password } = value;
    this.setState(
      {
        username,
        password,
      },
      async () => {
        await this.register();
      },
    );
  };

  confirm = () => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      visible: false,
    });

    // eslint-disable-next-line react/prop-types
    this.props.history.push('/login');
  };

  render() {
    const { visible } = this.state.modal;
    return (
      <div className="register">
        <Modal title="Alert" visible={visible} hasConfirm confirm={this.confirm} hasCancel={false}>
          <p className="content">You have successfully registered</p>
        </Modal>
        {/* <Message isShow = {this.state.message.isShow}  type = {this.state.message.type}  content = {this.state.message.content} /> */}
        <SignInSignUp setValue={this.setValue} isLogin={false} />
      </div>
    );
  }
}
