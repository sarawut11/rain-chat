/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';

function mapStateToProps(state) {
  return {
    userInfo: state.user.userInfo,
  };
}

class UserUpgrader extends Component {
  render() {
    console.log('\n\n----       User Upgrade       -----\n\n', this);
    return (
      <div>
        <Button type="primary">Upgrade Membership</Button>
      </div>
    );
  }
}

export default connect(mapStateToProps)(UserUpgrader);
