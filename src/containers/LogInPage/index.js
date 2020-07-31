import React, { Component } from 'react';
import { Row, Col, Modal } from 'antd';
import Request from '../../utils/request';
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
      totalRainedUsd: 0,
      totalRainedVitae: 0,
    };
  }

  async componentDidMount() {
    try {
      const res = await Request.axios('get', `/api/v1/total-rained-amount`);

      if (res && res.success) {
        this.setState({
          totalRainedUsd: res.totalRainedUsd,
          totalRainedVitae: res.totalRainedVitae,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
    }
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
        Modal.success({
          title: 'You have successfully logged in',
          onOk: this.confirm,
        });
      } else {
        console.log(res.message);
        notification(res.message, 'error');
      }
    } catch (error) {
      console.log(error);
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
    window.location.reload();
    const originalLink = sessionStorage.getItem('originalLink');
    if (originalLink) {
      sessionStorage.removeItem('originalLink');
      window.location.href = originalLink;
      return;
    }
    window.location.href = '/group_chat/vitae-rain-group';
  };

  render() {
    const { welcomeTitle, welcomeText, title1, text1, title2, text2 } = landingDescription;
    const { totalRainedUsd, totalRainedVitae } = this.state;
    return (
      <div className="login">
        <Row className="login-container">
          <Col xs={24} sm={24} md={24} lg={10} className="login-form-container">
            <Row justify="center" align="middle" style={{ height: '100vh' }}>
              <SignInSignUp setValue={this.setValue} isLogin />
            </Row>
          </Col>

          <Col xs={24} sm={24} md={24} lg={14} className="login-description-container">
            <Row justify="center" align="middle" style={{ minHeight: '100%' }}>
              <Col span={3} />
              <Col span={18}>
                <Row justify="center" align="middle" gutter={[0, 20]}>
                  <Col span={24}>
                    <Row justify="center">
                      <img
                        src="../../assets/vitae-logo.png"
                        alt="vitae-logo"
                        className="vitae-logo"
                      />
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
                </Row>
              </Col>
              <Col span={3} />
            </Row>
          </Col>
        </Row>

        <div className="login-floating-window">
          <span>
            Amount of Vitae Rained since opening: <b>{totalRainedVitae.toFixed(8)}</b>
          </span>
          {'  '}
          {/* <br /> */}
          <span>
            USD value: <b>$ {totalRainedUsd.toFixed(8)}</b>
          </span>
          <span>
            <a href="/faq">
              <b>FAQ</b>
            </a>
          </span>
        </div>

        <span className="login-logo-text">Vitae Rain Chat</span>
      </div>
    );
  }
}

export default LogIn;
