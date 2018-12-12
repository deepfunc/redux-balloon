import React from 'react';
import { Table } from 'antd';

class UserTable extends React.Component {
  constructor(props) {
    super(props);

    this.cols = this.createCols();
  }

  componentDidMount() {
    const { reloadTable } = this.props;
    reloadTable();
  }

  render() {
    return (
      <Table
        bordered
        rowKey="id"
        columns={this.cols}
        // dataSource={listData}
        // pagination={pagination}
        // loading={listLoading}
        // onChange={this.handleTableChange}
        // onRow={this.handleOnRow}
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
}

export default UserTable;
