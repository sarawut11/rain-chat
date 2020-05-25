import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import ModalBase from '../ModalBase';

function confirmCancelRender(props) {
  const { hasCancel, hasConfirm, confirm, cancel } = props;
  if (hasCancel && hasConfirm) {
    return (
      <div className="twoButton">
        <p onClick={cancel}>Cancel</p>
        <p onClick={confirm}>Confirm</p>
      </div>
    );
  }
  if (hasConfirm || hasCancel) {
    return (
      <div className="oneButton">
        {hasCancel && <p onClick={cancel}>cancel</p>}
        {hasConfirm && <p onClick={confirm}>Confirm</p>}
      </div>
    );
  }
  return null;
}

confirmCancelRender.propTypes = {
  hasCancel: PropTypes.bool,
  hasConfirm: PropTypes.bool,
  cancel: PropTypes.func, // The premise of canceling Modal by clicking the mask is that there is a cancel method
  confirm: PropTypes.func,
};

confirmCancelRender.defaultProps = {
  hasCancel: false,
  hasConfirm: false,
  cancel: undefined,
  confirm: undefined,
};

function dialogRender(props) {
  const { title, children } = props;
  return (
    <div className="dialogRender">
      <h3 className="title">{title}</h3>
      {children}
      {confirmCancelRender({ ...props })}
    </div>
  );
}

dialogRender.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

dialogRender.defaultProps = {
  title: '',
  children: undefined,
};

const ModalDialogRender = ModalBase(dialogRender);
// TODO: （refactor）take thinner component
export default function Modal(props) {
  return <ModalDialogRender {...props} />;
}
