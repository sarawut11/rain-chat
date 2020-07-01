import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Descriptions,
  notification,
  Spin,
  Row,
  Col,
  Collapse,
  Table,
  Upload,
  message,
  Button,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { setAdminAction } from '../../../containers/AdminPage/adminAction';
import Request from '../../../utils/request';

const { Panel } = Collapse;

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

const renderModerItem = item => (
  <Row style={{ width: '100%', margin: 0 }} gutter={[20, 10]} align="middle">
    <Col span={12}>{item.username}</Col>
    <Col span={12}>
      Total Payment:
      {item.totalPayment}
    </Col>
  </Row>
);

const uploadDummyProps = {
  name: 'file',
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  headers: {
    authorization: 'authorization-text',
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

class FinanceReport extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  async componentDidMount() {
    const user_info = JSON.parse(localStorage.getItem('userInfo'));

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/admin/moders`);

        if (res && res.success) {
          this.props.setAdmin({ data: res });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get data.',
        });
      }

      this.setState({ loading: false });
    }
  }

  render() {
    const {
      adRevenue,
      upgradedRevenue,
      ownerPayment,
      moders,
      totalExpenses,
      paidExpenses,
      unpaidExpenses,
    } = this.props.adminState;

    const { loading } = this.state;

    const dataSource = [
      {
        key: '1',
        date: '2020/6/30',
        payment: '$2013',
      },
      {
        key: '2',
        date: '2020/6/29',
        payment: '$2013',
      },
      {
        key: '3',
        date: '2020/6/28',
        payment: '$2013',
      },
      {
        key: '4',
        date: '2020/6/27',
        payment: '$2013',
      },
      {
        key: '5',
        date: '2020/6/26',
        payment: '$2013',
      },
    ];

    const columns = [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
      },
      {
        title: 'Payment',
        dataIndex: 'payment',
        key: 'payment',
      },
    ];

    return (
      <div>
        <h2>Financial Report</h2>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Row gutter={[0, 20]}>
            <Col span={24}>
              <Descriptions bordered title="Revenue">
                <Descriptions.Item label="Ad revenue">{adRevenue}</Descriptions.Item>
                <Descriptions.Item label="Upgraded revenue">{upgradedRevenue}</Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={24}>
              <Descriptions bordered title="Owner Payments">
                <Descriptions.Item label="Owner 1">{ownerPayment}</Descriptions.Item>
                <Descriptions.Item label="Owner 2">{ownerPayment}</Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={24}>
              <div className="ant-descriptions-title">Moderator Payments</div>
              <Collapse>
                {moders.map(moder => (
                  <Panel header={renderModerItem(moder)} key={moder.username}>
                    <Table dataSource={dataSource} columns={columns} pagination={false} />
                  </Panel>
                ))}
              </Collapse>
            </Col>

            <Col span={24}>
              <div className="ant-descriptions-title">Expenses</div>
              <div className="expense-upload-container">
                <Upload {...uploadDummyProps}>
                  <Button>
                    <UploadOutlined /> Click to upload expense pdf file
                  </Button>
                </Upload>
              </div>
              <Descriptions bordered>
                <Descriptions.Item label="TotalExpenses">{totalExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Unpaid">{unpaidExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Paid">{paidExpenses}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinanceReport);
