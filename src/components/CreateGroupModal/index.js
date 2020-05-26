import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';
import './styles.scss';
import notification from '../Notification';

export default class GroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: props.defaultGroupName,
      groupNotice: props.defaultGroupNotice,
    };
  }

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  _confirm = () => {
    const { groupName, groupNotice } = this.state;
    if (!groupName || !groupNotice) {
      notification('Do you have a blank line?', 'error');
      return;
    }
    if (groupName === 'rain-chat') {
      notification(
        'This group name is only for the project itself, please use another group name',
        'error',
      );
      return;
    }
    this.props.confirm({ groupName, groupNotice });
  };

  render() {
    const { modalVisible, cancel, title } = this.props;
    const { groupName, groupNotice } = this.state;
    return (
      <Modal
        title={title}
        visible={modalVisible}
        confirm={this._confirm}
        hasCancel
        hasConfirm
        cancel={cancel}
      >
        <div className="groupModalContent">
          <div>
            <span>Group name:</span>
            <input
              name="groupName"
              value={groupName}
              onChange={this.handleChange}
              type="text"
              placeholder="Less than 12 letters"
              maxLength="12"
            />
          </div>
          <div>
            <span>Group Notice:</span>
            <textarea
              name="groupNotice"
              value={groupNotice}
              onChange={this.handleChange}
              rows="3"
              type="text"
              placeholder="Less than 60 letters"
              maxLength="60"
            />
          </div>
        </div>
      </Modal>
    );
  }
}

GroupModal.propTypes = {
  modalVisible: PropTypes.bool,
  confirm: PropTypes.func,
  cancel: PropTypes.func,
  title: PropTypes.string,
  defaultGroupName: PropTypes.string,
  defaultGroupNotice: PropTypes.string,
};

GroupModal.defaultProps = {
  modalVisible: false,
  confirm() {},
  cancel() {},
  title: '',
  defaultGroupName: '',
  defaultGroupNotice: '',
};
