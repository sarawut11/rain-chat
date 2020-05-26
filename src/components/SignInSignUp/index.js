import React, { Component } from 'react';
import './index.scss';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Request from '../../utils/request';
import Spinner from '../Spinner';
import UserAvatar from '../UserAvatar';

export default class SignInSignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      showSpinner: true,
    };
  }

  handleChange = event => {
    const { target } = event;
    this.setState({ [target.name]: target.value });
  };

  async loginGithub() {
    const href = window.location.href;
    if (/\/login\?code/.test(href)) {
      const code = href.split('?code=')[1];
      Request.axios('post', '/api/v1/github_oauth', {
        code,
        clientId: this.clientId,
      })
        .then(response => {
          localStorage.setItem('userInfo', JSON.stringify(response));
          window.location.reload();
          const originalLink = sessionStorage.getItem('originalLink');
          if (originalLink) {
            sessionStorage.removeItem('originalLink');
            window.location.href = originalLink;
            return;
          }
          window.location.href = '/';
        })
        .catch(error => {
          console.log(
            'Before logging in with github, please make sure that your github is set up with a public email, otherwise it may fail error => ',
            error,
          );
          window.open(
            'https://user-images.githubusercontent.com/24861316/75133098-6b564600-5714-11ea-824a-b367ed55b1a1.png',
          );
          window.location.href = '/login';
        });
    }
  }

  componentDidMount() {
    this.loginGithub().then(() => {
      this.setState({ showSpinner: false });
    });
  }

  handleClick = () => {
    this.props.setValue(this.state);
  };

  get clientId() {
    return '8c694af835d62f8fd490';
  }

  render() {
    const { isLogin } = this.props;
    const { name, password } = this.state;
    const loginClass = isLogin ? 'active' : 'inactive';
    const registerClass = isLogin ? 'inactive' : 'active';
    const linkUrl = isLogin ? '/register' : '/login';
    const buttonName = isLogin ? 'Log in' : 'Register';
    const OAuthHref = `https://github.com/login/oauth/authorize?client_id=${this.clientId}`;
    return (
      <div className="formContent fadeInDown">
        {this.state.showSpinner && <Spinner />}
        <div className="ghChatLogo">
          <img src="../../assets/vitae-logo.png" alt="vitae-logo" />
        </div>
        <Link to={linkUrl}>
          <span className={loginClass}>Log in</span>
        </Link>
        <Link to={linkUrl}>
          <span className={registerClass}>Register</span>
        </Link>
        <div className="userAvatarWrapper">
          <UserAvatar name={name || 'U'} size="100" />
        </div>
        <div className="center">
          <input
            type="text"
            name="name"
            value={name}
            onChange={this.handleChange}
            placeholder="Username"
          />
        </div>
        <div className="center">
          <input
            type="password"
            name="password"
            value={password}
            onChange={this.handleChange}
            placeholder="Password"
          />
        </div>
        <div className="center">
          <input type="button" onClick={this.handleClick} value={buttonName} />
        </div>
        {/* <div className="center">
          <p className="authTips">Github Login</p>
          <a className="githubOAuth" href={OAuthHref}>
            <svg className="icon githubIcon" aria-hidden="true">
              <use xlinkHref="#icon-github" />
            </svg>
          </a>
        </div> */}
        <div className="version">Version: 1.0.0</div>
      </div>
    );
  }
}

SignInSignUp.propTypes = {
  setValue: PropTypes.func,
  isLogin: PropTypes.bool,
};

SignInSignUp.defaultProps = {
  setValue() {},
  isLogin: false,
};
