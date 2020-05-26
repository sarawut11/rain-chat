import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Switch from 'rc-switch';
import { GLOBAL_SETTINGS } from '../../containers/SettingPage/settingReducer';
import './styles.scss';
import Button from '../Button';
import Modal from '../Modal';

function openRepoUrl(history) {
  if (process.env.NODE_ENV === 'production') {
    history.push('/group_chat/ddbffd80-3663-11e9-a580-d119b23ef62e');
  } else {
    window.open('https://im.aermin.top/group_chat/ddbffd80-3663-11e9-a580-d119b23ef62e');
  }
}

function Setting({ initApp, history, globalSettings, setGlobalSettings }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

      <div className="notificationConfig">
        <span>Notification: </span>
        <Switch
          onChange={value => _onChange(GLOBAL_SETTINGS.NOTIFICATION, value)}
          checked={globalSettings.notification}
        />
      </div>

      <Button clickFn={() => setLogoutModalVisible(true)} value="Sign out" />
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
