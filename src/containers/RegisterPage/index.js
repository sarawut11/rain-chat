import React, { Component } from 'react';
import './index.scss';
import { Row, Spin } from 'antd';
import Request from '../../utils/request';
import Modal from '../../components/Modal';
import notification from '../../components/Notification';
import SignInSignUp from '../../components/SignInSignUp';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      username: '',
      password: '',
      modal: {
        visible: false,
      },
      show: false,
      sponsor: '',
    };
  }

  async componentDidMount() {
    console.log('registerpage componentdidmount');
    const url_string = window.location.href;
    const url = new URL(url_string);
    const refcode = url.searchParams.get('ref');
    console.log(refcode);
    if (refcode === null || refcode === '') {
      window.location.href = '/404';
    }

    const scope = this;

    try {
      const res = await Request.axios('post', '/api/v1/ref/validate', { refcode });

      if (res && res.success) {
        // Popup
        scope.setState({
          show: true,
          sponsor: refcode,
        });
      } else {
        notification(res.message, 'error');
        window.location.href = '/404';
      }
    } catch (error) {
      notification(error, 'error');
      window.location.href = '/404';
    }
  }

  register = async () => {
    const { name, email, username, password, sponsor } = this.state;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      notification('Invalid Email Format', 'warn');
      return;
    }
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
        name,
        email,
        username,
        password,
        sponsor,
      });
      if (res && res.success) {
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
  };

  setValue = value => {
    const { name, email, username, password } = value;
    this.setState(
      {
        name,
        email,
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
    const { show } = this.state;
    return (
      <div className="register">
        <Modal title="Alert" visible={visible} hasConfirm confirm={this.confirm} hasCancel={false}>
          <p className="content">You have successfully registered</p>
        </Modal>
        {/* <Message isShow = {this.state.message.isShow}  type = {this.state.message.type}  content = {this.state.message.content} /> */}
        {show ? (
          <SignInSignUp setValue={this.setValue} isLogin={false} />
        ) : (
          <Row justify="center" align="middle">
            <Spin />
          </Row>
        )}
      </div>
    );
  }
}
