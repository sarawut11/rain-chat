import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import './styles.scss';
import CustomButton from '../Button';

function Setting({ initApp, history }) {
  const logout = () => {
    window.socket.disconnect();
    localStorage.removeItem('userInfo');
    initApp(false);
    history.push('/login');
  };

  const showLogoutModal = () => {
    Modal.confirm({
      onOk: logout,
      title: 'Are you sure to exit?',
    });
  };

  return (
    <div className="setting">
      <CustomButton clickFn={showLogoutModal} value="Sign out" />
    </div>
  );
}

Setting.propTypes = {
  initApp: PropTypes.func,
  history: PropTypes.object.isRequired,
};

Setting.defaultProps = {
  initApp() {},
};

export default withRouter(Setting);
