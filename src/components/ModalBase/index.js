import React from 'react';
import './styles.scss';
import { Modal } from 'antd';

function ModalBase(Comp) {
  return props => {
    const { visible = false, cancel, modalWrapperClassName } = props;
    return (
      <Modal visible={visible} className={modalWrapperClassName} onCancel={cancel} footer={null}>
        <Comp {...props} />
      </Modal>
    );
  };
}

export default ModalBase;
