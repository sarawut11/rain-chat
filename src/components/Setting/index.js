import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Row, Col, Input, Button } from 'antd';
import axios from 'axios';
import Switch from 'rc-switch';
import Request from '../../utils/request';
import { GLOBAL_SETTINGS } from '../../containers/SettingPage/settingReducer';
import './styles.scss';
import CustomButton from '../Button';
import Modal from '../Modal';
import notification from '../Notification';

function openRepoUrl(history) {
  if (process.env.NODE_ENV === 'production') {
    history.push('/group_chat/ddbffd80-3663-11e9-a580-d119b23ef62e');
  } else {
    window.open('https://im.aermin.top/group_chat/ddbffd80-3663-11e9-a580-d119b23ef62e');
  }
}

function Setting({ initApp, history, globalSettings, setGlobalSettings }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const user_info = JSON.parse(localStorage.getItem('userInfo'));

  const [refLink, setRefLink] = useState(
    user_info ? `${window.location.origin}/register?ref=${user_info.uniqueid}` : '',
  );

  const logout = () => {
    window.socket.disconnect();
    localStorage.removeItem('userInfo');
    initApp(false);
    history.push('/login');
  };

  const _onChange = (type, value) => {
    setGlobalSettings({
      [type]: value,
    });
  };

  const generateRefLink = async () => {
    const sponsor = user_info.username;

    try {
      const res = await Request.axios('post', '/api/v1/ref/generate', { sponsor });

      if (res && res.success) {
        setRefLink(res.refcode);
        localStorage.setItem('refLink', res.refcode);
      } else {
        notification(res.message, 'error');
      }
    } catch (error) {
      notification(error, 'error');
    }
  };

  const onGenerateRefClick = async () => {
    await generateRefLink();
  };

  return (
    <div className="setting">
      <Modal
        title="Are you sure to exit?"
        visible={logoutModalVisible}
        confirm={logout}
        hasCancel
        hasConfirm
        cancel={() => setLogoutModalVisible(false)}
      />

      {/* <div className="notificationConfig">
        <span>Notification: </span>
        <Switch
          onChange={value => _onChange(GLOBAL_SETTINGS.NOTIFICATION, value)}
          checked={globalSettings.notification}
        />
      </div> */}

      <Row justify="center" align="middle" gutter={[10, 10]}>
        <Col span={24}>
          <Row justify="center" align="middle">
            Reference Link
          </Row>
        </Col>

        <Col span={24}>
          <Row justify="center" align="middle">
            <Input disabled value={refLink} />
          </Row>
        </Col>

        {/* <Col span={24}>
          <Row justify="center" align="middle">
            <Button type="primary" onClick={onGenerateRefClick}>
              Generate Reference Link
            </Button>
          </Row>
        </Col> */}
      </Row>

      <CustomButton clickFn={() => setLogoutModalVisible(true)} value="Sign out" />
    </div>
  );
}

Setting.propTypes = {
  initApp: PropTypes.func,
  history: PropTypes.object.isRequired,
  globalSettings: PropTypes.object,
  setGlobalSettings: PropTypes.func,
};

Setting.defaultProps = {
  initApp() {},
  globalSettings: {},
  setGlobalSettings() {},
};

export default withRouter(Setting);
