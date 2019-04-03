import React from 'react';
import { Table, message } from 'antd';

class UserTable extends React.Component {
  constructor(props) {
    super(props);
    this.cols = this.createCols();
  }

  componentDidMount() {
    const { reloadTable } = this.props;
    reloadTable();
  }

  componentDidUpdate(prevProps) {
    this.checkError(this.props, prevProps);
  }

  render() {
    const { table: { loading, data, pagination } } = this.props;
    return (
      <Table
        bordered
        rowKey="id"
        columns={this.cols}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={this.handleTableChange}
      />
    );
  }

  createCols() {
    return [
      {
        title: 'Username',
        dataIndex: 'userName',
        key: 'userName',
        width: 200
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        width: 140
      },
      {
        title: 'Sex',
        dataIndex: 'sex',
        key: 'sex',
        width: 200
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address'
      }
    ];
  }

  checkError(props, prevProps) {
    const { error } = props.table;
    const { error: prevError } = prevProps.table;
    error !== prevError && message.error(error.message);
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { updateTableParams } = this.props;

    const payload = {
      pagination: { current: pagination.current, pageSize: pagination.pageSize }
    };
    updateTableParams(payload);
  };
}

export default UserTable;
