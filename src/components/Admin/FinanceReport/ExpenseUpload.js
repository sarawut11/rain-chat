/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-nested-ternary */
/* eslint-disable func-names */
import React from 'react';
import { connect } from 'react-redux';
import { Upload, message, notification, Button, Modal, Form, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Request from '../../../utils/request';
import { createExpense } from '../../../redux/actions/expenseAction';
import '../styles.scss';

function mapStateToProps(state) {
  return {
    expenseInfo: state.expenseInfo,
  };
}

const mapDispatchToProps = dispatch => ({
  createExpense(arg) {
    dispatch(createExpense(arg));
  },
});

function beforeUpload(file) {
  console.log('file.type:\n', file.type);
  const isPdf = file.type === 'application/pdf';
  if (!isPdf) {
    message.error('You can only upload PDF file!');
  }
  return isPdf;
}

const initialState = {
  loading: false,
  confirmLoading: false,
  visible: false,
  file: null,
  amount: 0,
};

class ExpenseUpload extends React.Component {
  state = {
    ...initialState,
  };

  uploadToServer = async () => {
    try {
      const { file, amount } = this.state;
      const data = new FormData();

      data.append('doc', file);
      data.append('amount', amount);

      const res = await Request.axios('post', `/api/v1/expense/create`, data);

      if (res && res.success) {
        this.props.createExpense({ expenseInfo: res.expenseInfo });

        notification.success({
          message: res.message,
        });

        this.setState({ visible: false });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to upload expense.',
      });
    }
  };

  handleUploadAction = file => {
    const fr = new FileReader();
    const scope = this;

    fr.onload = function() {
      const myFile = new File([file], 'expense.pdf');

      scope.setState({ file: myFile, loading: false });
    };

    fr.readAsDataURL(file);

    return 'https://www.mocky.io/v2/5cc8019d300000980a055e76';
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  hideModal = () => {
    this.setState({ visible: false });
  };

  handleOk = async () => {
    this.setState({ confirmLoading: true });
    await this.uploadToServer();
    this.setState({ confirmLoading: false });
  };

  onAmountChange = value => {
    this.setState({ amount: value });
  };

  render() {
    const { visible, amount, confirmLoading } = this.state;
    const uploadButton = (
      <Button>
        <UploadOutlined /> Click to upload expense pdf file
      </Button>
    );

    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Upload expense
        </Button>
        <Modal
          title="Upload expense"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          confirmLoading={confirmLoading}
        >
          <Upload
            name="expense-upload"
            action={this.handleUploadAction}
            beforeUpload={beforeUpload}
            className="expense-upload"
          >
            {uploadButton}
          </Upload>

          <Form.Item label="Amount" className="expense-amount-form">
            <InputNumber min={0} value={amount} onChange={this.onAmountChange} />
          </Form.Item>
        </Modal>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExpenseUpload);
