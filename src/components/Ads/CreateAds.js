import React, { Component } from 'react';
import { Modal, Button, Form, Input } from 'antd';

const { Item } = Form;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};
export default class CreateAds extends Component {
  state = { asset: null, link: '', button_name: '', title: '', description: '' };

  handleOk = e => {
    console.log(e);
    this.props.hideModal();
  };

  handleCancel = e => {
    console.log(e);
    this.props.hideModal();
  };

  _onChange = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  render() {
    const { visible } = this.props;
    const { asset, link, button_name, title, description } = this.state;
    return (
      <div>
        <Modal
          title="Create a new advertisement"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form {...layout}>
            <Item label="Title">
              <Input name="title" value={title} onChange={this._onChange} />
            </Item>
            <Item label="Description">
              <TextArea name="description" value={description} onChange={this._onChange} />
            </Item>
            <Item label="Link">
              <Input name="link" value={link} onChange={this._onChange} />
            </Item>
            <Item label="Button Label">
              <Input name="button_name" value={button_name} onChange={this._onChange} />
            </Item>
          </Form>
        </Modal>
      </div>
    );
  }
}
