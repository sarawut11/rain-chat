import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Descriptions, notification, Spin, Row, Col, Collapse, Table, Button, Tag } from 'antd';
import { setExpensesInfo, updateExpense } from '../../../redux/actions/expenseAction';
import { setAdminAction } from '../../../containers/AdminPage/adminAction';
import Request from '../../../utils/request';
import ExpenseUpload from './ExpenseUpload';
import {
  EXPENSE_CREATED,
  EXPENSE_REQUESTED,
  EXPENSE_CONFIRMED,
  EXPENSE_REJECTED,
  EXPENSE_WITHDREW,
} from './constant';

const { Panel } = Collapse;

function mapStateToProps(state) {
  return {
    adminState: state.adminState,
    expenseInfo: state.expenseInfo,
    userInfo: state.user,
  };
}

const mapDispatchToProps = dispatch => ({
  setExpensesInfo(arg) {
    dispatch(setExpensesInfo(arg));
  },
  updateExpense(arg) {
    dispatch(updateExpense(arg));
  },
  setAdmin(arg) {
    dispatch(setAdminAction(arg));
  },
});

const renderModerItem = item => (
  <Row style={{ width: '100%', margin: 0 }} gutter={[20, 10]} align="middle">
    <Col span={12}>Username: {item.username}</Col>
    <Col span={12}>
      Total Payment:
      {item.totalPayment}
    </Col>
  </Row>
);

class FinanceReport extends Component {
  state = {
    // eslint-disable-next-line react/no-unused-state
    loading: false,
  };

  async componentDidMount() {
    const user_info = this.props.userInfo.userInfo;

    if (user_info.role === 'OWNER') {
      this.setState({ loading: true });

      try {
        const res = await Request.axios('get', `/api/v1/expense/get-all`);

        if (res && res.success) {
          const { ownerCount, expenses, totalExpenses, paidExpenses, unpaidExpenses } = res;
          this.props.setExpensesInfo({
            ownerCount,
            expenses,
            totalExpenses,
            paidExpenses,
            unpaidExpenses,
          });
        } else {
          notification.error({
            message: res.message,
          });
        }
      } catch (error) {
        console.log(error);
        notification.error({
          message: 'Failed to get expense data.',
        });
      }

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

  onAccept = expenseId => async () => {
    console.log('onAccept\n', expenseId);
    try {
      const res = await Request.axios('post', `/api/v1/expense/approve`, { expenseId });

      if (res && res.success) {
        this.props.updateExpense({ expenseInfo: res.expenseInfo });
        notification.success({
          message: res.message,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to accept.',
      });
    }
  };

  onReject = expenseId => async () => {
    console.log('onReject\n', expenseId);
    try {
      const res = await Request.axios('post', `/api/v1/expense/reject`, { expenseId });

      if (res && res.success) {
        this.props.updateExpense({ expenseInfo: res.expenseInfo });
        notification.success({
          message: res.message,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to reject.',
      });
    }
  };

  onWithdraw = expenseId => async () => {
    console.log('onWithdraw\n', expenseId);
    try {
      const res = await Request.axios('post', `/api/v1/expense/withdraw`, { expenseId });

      if (res && res.success) {
        this.props.updateExpense({ expenseInfo: res.expenseInfo });
        notification.success({
          message: res.message,
        });
      } else {
        notification.error({
          message: res.message,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: 'Failed to withdraw.',
      });
    }
  };

  render() {
    const { adRevenue, upgradedRevenue, ownerPayment, moders } = this.props.adminState;

    const {
      ownerCount,
      expenses,
      totalExpenses,
      paidExpenses,
      unpaidExpenses,
    } = this.props.expenseInfo;
    const { userInfo } = this.props.userInfo;
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

    const expenseTableCol = [
      {
        title: 'Date',
        dataIndex: 'time',
        key: 'time',
        render(time) {
          const date = new Date(time * 1000);
          return <span>{date.toLocaleString()}</span>;
        },
      },
      {
        title: 'Document',
        dataIndex: 'docPath',
        key: 'docPath',
        render: docPath => (
          // eslint-disable-next-line react/jsx-no-target-blank
          <a href={docPath} target="_blank">
            Download
          </a>
        ),
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
      },
      {
        title: 'Creator',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'Confirmers',
        dataIndex: 'approves',
        key: 'approves',
        render(approves) {
          let approvesStr = '';

          if (approves) {
            approves.forEach(approve => {
              if (approvesStr === '') {
                approvesStr = `${approve.username}`;
              } else {
                approvesStr += `, ${approve.username}`;
              }
            });
          }

          return (
            <div>
              {approvesStr} ({approves ? approves.length : 0}/{ownerCount})
            </div>
          );
        },
      },
      {
        title: 'Rejectors',
        dataIndex: 'rejects',
        key: 'rejects',
        render(rejects) {
          let rejectsStr = '';

          if (rejects) {
            rejects.forEach(reject => {
              if (rejectsStr === '') {
                rejectsStr = `${reject.username}`;
              } else {
                rejectsStr += `, ${reject.username}`;
              }
            });
          }

          return (
            <div>
              {rejectsStr} ({rejects ? rejects.length : 0}/{ownerCount})
            </div>
          );
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <div>
            {status === EXPENSE_CREATED && <Tag color="#2db7f5">created</Tag>}
            {status === EXPENSE_REQUESTED && <Tag color="#108ee9">requested</Tag>}
            {status === EXPENSE_CONFIRMED && <Tag color="#87d068">confirmed</Tag>}
            {status === EXPENSE_REJECTED && <Tag color="#f50">rejected</Tag>}
            {status === EXPENSE_WITHDREW && <Tag color="#108ee9">withdrew</Tag>}
          </div>
        ),
      },
      {
        title: '',
        dataIndex: 'id',
        key: 'expenseId',
        render: (id, expense) => {
          let alreadyDecided = false;

          if (expense.approves) {
            expense.approves.forEach(approve => {
              if (userInfo.username === approve.username) {
                alreadyDecided = true;
              }
            });
          }

          if (expense.rejects) {
            expense.rejects.forEach(reject => {
              if (userInfo.username === reject.username) {
                alreadyDecided = true;
              }
            });
          }

          return (
            <div>
              {userInfo.username !== expense.username &&
                expense.status === EXPENSE_CREATED &&
                !alreadyDecided && (
                  <div>
                    <Button type="primary" onClick={this.onAccept(id)}>
                      Approve
                    </Button>
                    <Button danger onClick={this.onReject(id)} className="expense-reject-btn">
                      Reject
                    </Button>
                  </div>
                )}
              {userInfo.username === expense.username && expense.status === EXPENSE_CONFIRMED && (
                <div>
                  <Button onClick={this.onWithdraw(id)}>Withdraw</Button>
                </div>
              )}
            </div>
          );
        },
      },
    ];

    console.log('\n\n -----      Expense render       ------ \n\n', this);

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
              <Descriptions bordered>
                <Descriptions.Item label="TotalExpenses">{totalExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Unpaid">{unpaidExpenses}</Descriptions.Item>
                <Descriptions.Item label="Expenses Paid">{paidExpenses}</Descriptions.Item>
              </Descriptions>

              <div className="expense-upload-container">
                <ExpenseUpload />
              </div>

              <div className="expense-table">
                <Table
                  dataSource={expenses}
                  columns={expenseTableCol}
                  bordered
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FinanceReport);
