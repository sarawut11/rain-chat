import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import ModalBase from '../ModalBase';

function dialogRender(props) {
  const { title, children } = props;
  return (
    <div className="dialogRender">
      <h3 className="title">{title}</h3>
      {children}
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
