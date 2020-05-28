import React, { Component } from 'react';
import { Row, Col } from 'antd';
import Request from '../../utils/request';
import Modal from '../../components/Modal';
import notification from '../../components/Notification';
import SignInSignUp from '../../components/SignInSignUp';
import { landingDescription } from '../../constants/login';
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
    const {
      welcomeTitle,
      welcomeText,
      title1,
      text1,
      title2,
      text2,
      title3,
      text3,
    } = landingDescription;
    return (
      <div className="login">
        <Modal title="Alert" visible={visible} confirm={this.confirm} hasConfirm>
          <p className="content">You have successfully logged in</p>
        </Modal>

        <Row justify="space-around" align="middle" className="login-container">
          <Col xs={24} sm={24} md={24} lg={10} className="login-form-container">
            <Row justify="center" align="middle" style={{ height: '100%' }}>
              <SignInSignUp setValue={this.setValue} isLogin />
            </Row>
          </Col>

          <Col xs={24} sm={24} md={24} lg={14} className="login-description-container">
            <Row justify="center" align="middle">
              <Col span={3} />
              <Col span={18}>
                <Row justify="center" align="middle" gutter={[0, 20]}>
                  <Col span={24}>
                    <Row justify="center">
                      <img src="../../assets/vitae-logo.png" alt="vitae-logo" />
                    </Row>
                  </Col>

                  <Col span={24}>
                    <h1>{welcomeTitle}</h1>
                    <p>{welcomeText}</p>
                  </Col>

                  <Col span={24}>
                    <h2>{title1}</h2>
                    <p>{text1}</p>
                  </Col>

                  <Col span={24}>
                    <h2>{title2}</h2>
                    <p>{text2}</p>
                  </Col>

                  <Col span={24}>
                    <h2>{title3}</h2>
                    <p>{text3}</p>
                  </Col>
                </Row>
              </Col>
              <Col span={3} />
            </Row>
          </Col>
        </Row>

        <span className="login-logo-text">Vitae Rain Chat</span>
      </div>
    );
  }
}

export default LogIn;
