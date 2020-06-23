import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions } from 'antd';
import { setAdminAction } from '../../../containers/AdminPage/adminAction';

function mapStateToProps(state) {
  return {
    adminState: state.adminState,
  };
}

const mapDispatchToProps = dispatch => ({
  setAdmin(arg) {
    dispatch(setAdminAction(arg));
  },
});

class AdminHome extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  render() {
    const {
      totalMembersCount,
      freeMembersCount,
      upgradedMembersCount,
      onlineModeratorsCount,
      membersInRainRoomCount,
    } = this.props.adminState;
    return (
      <div>
        <h2>Admin Dashboard</h2>
        <Descriptions bordered>
          <Descriptions.Item label="Total Members">{totalMembersCount}</Descriptions.Item>
          <Descriptions.Item label="Upgraded Members">{upgradedMembersCount}</Descriptions.Item>
          <Descriptions.Item label="Free Members">{freeMembersCount}</Descriptions.Item>
          <Descriptions.Item label="Members in Rain Room">
            {membersInRainRoomCount}
          </Descriptions.Item>
          <Descriptions.Item label="Moderators Online">{onlineModeratorsCount}</Descriptions.Item>
        </Descriptions>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminHome);
