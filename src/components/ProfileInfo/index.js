/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { Form, Input, Button, Row, notification as antNotification } from 'antd';
import ModalBase from '../ModalBase';
import UserAvatar from '../UserAvatar';
import './styles.scss';
import notification from '../Notification';
import Request from '../../utils/request';
import AvatarUpload from '../AvatarUpload';
import { imageInfo } from 'qiniu-js';

class userInfoRender extends Component {
  state = {
    avatar: null,
    email: '',
    intro: '',
    name: '',
    referral: '',
    username: '',
    updateAvailable: false,
    updating: false,
  };

  componentDidMount() {
    this.setState({ ...this.props.userInfo });
  }

  _onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value, updateAvailable: true });
  };

  onUpdateClick = async () => {
    const { name, intro, username, avatar } = this.state;
    this.setState({ updating: true });
    try {
      // await Request.axios('post', `/api/v1/user/${username}/avatar`, { avatar });
      console.log('avatar', avatar);
      const data = new FormData();
      data.append('avatar', avatar);
      data.append('name', name);
      data.append('intro', intro);
      const res = await Request.axios('put', `/api/v1/user/${username}`, data);

      if (res && res.success) {
        localStorage.setItem('userInfo', JSON.stringify({ ...this.props.userInfo, name, intro }));
        notification(res.message, 'info');
        antNotification.success({
          message: res.message,
        });
      } else {
        notification(res.message, 'error');
        antNotification.error({
          message: res.message,
        });
      }
    } catch (error) {
      notification(error, 'error');
      antNotification.error({
        message: 'Profile update failed.',
      });
    }
    this.setState({ updating: false });
  };

  onAvatarImageChange = file => {
    console.log('onavatar image change', file);
    this.setState({ avatar: file, updateAvailable: true });
  };

  render() {
    const {
      username,
      name,
      intro,
      avatar,
      referral,
      email,
      updateAvailable,
      updating,
    } = this.state;

    return (
      <div className="userInfo">
        {/* <UserAvatar name={username} src={avatar} size="50" /> */}

        <Row justify="center">
          <AvatarUpload onChange={this.onAvatarImageChange} />
        </Row>

        {username && <p className="name">{username}</p>}

        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 17 }}>
          <Form.Item label="Name">
            <Input value={name} name="name" onChange={this._onChange} placeholder="Name" />
          </Form.Item>
          <Form.Item label="Intro">
            <Input.TextArea
              value={intro}
              name="intro"
              onChange={this._onChange}
              placeholder="Introduce yourself."
            />
          </Form.Item>
          <Form.Item label="Email">{email}</Form.Item>
          <Form.Item label="Referral link">{`${window.location.origin}/register?ref=${referral}`}</Form.Item>
          <Row justify="center" align="middle">
            <Button
              type="primary"
              onClick={this.onUpdateClick}
              disabled={!updateAvailable}
              loading={updating}
            >
              Update
            </Button>
          </Row>
        </Form>
      </div>
    );
  }
}

const ModalRender = ModalBase(userInfoRender);

class ProfileInfo extends Component {
  render() {
    const { userInfo, modalVisible, hide } = this.props;
    return <ModalRender userInfo={userInfo} visible={modalVisible} cancel={hide} />;
  }
}

ProfileInfo.propTypes = {
  userInfo: PropTypes.object,
  hide: PropTypes.func,
  modalVisible: PropTypes.bool,
};

ProfileInfo.defaultProps = {
  userInfo: {},
  hide() {},
  modalVisible: false,
};

export default withRouter(ProfileInfo);
