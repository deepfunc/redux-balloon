import React from 'react';
import { Row, Col, Button, Input } from 'antd';
import styles from './styles/user-toolbar.less';

const ButtonGroup = Button.Group;
const Search = Input.Search;

class UserToolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { toolbar: { searchKeywords } } = this.props;

    return (
      <div className={styles.root}>
        <Row>
          <Col span={12}>
            <ButtonGroup>
              <Button
                icon="plus"
                title="new"
                onClick={this.handleAdd}
              />
              <Button
                icon="edit"
                title="edit"
                onClick={this.handleEdit}
              />
              <Button
                icon="reload"
                title="reload"
                onClick={this.handleReload}
              />
            </ButtonGroup>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Search
              className={styles.searchKeywords}
              placeholder="search"
              value={searchKeywords}
              onChange={this.handleChangeKeywords}
              onSearch={this.handleUpdateKeywords}
            />
          </Col>
        </Row>
      </div>
    );
  }

  handleAdd = () => {
    const { onAdd } = this.props;

    if (onAdd) {
      onAdd();
    }
  };

  handleEdit = () => {
    const { onEdit } = this.props;

    if (onEdit) {
      onEdit();
    }
  };

  handleReload = () => {
    const { onReload } = this.props;

    if (onReload) {
      onReload();
    }
  };

  handleChangeKeywords = e => {
    const { updateSearchKeywords } = this.props;
    updateSearchKeywords(e.target.value);
  };

  handleUpdateKeywords = value => {
    const { onUpdateKeywords } = this.props;

    if (onUpdateKeywords) {
      onUpdateKeywords(value);
      this.handleReload();
    }
  };
}

export default UserToolbar;
