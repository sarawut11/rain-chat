import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import './styles.scss';
import CustomButton from '../Button';
import Modal from '../Modal';

function Setting({ initApp, history }) {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const logout = () => {
    window.socket.disconnect();
    localStorage.removeItem('userInfo');
    initApp(false);
    history.push('/login');
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
      <CustomButton clickFn={() => setLogoutModalVisible(true)} value="Sign out" />
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
