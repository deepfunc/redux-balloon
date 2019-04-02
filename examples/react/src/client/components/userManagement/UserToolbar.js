import React from 'react';
import { Row, Col, Button, Input } from 'antd';
import { debounce } from 'throttle-debounce';
import styles from './styles/user-toolbar.less';

const ButtonGroup = Button.Group;
const Search = Input.Search;

class UserToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchKeywords: props.toolbar.searchKeywords };
    this.updateSearchKeywords = debounce(500, (value) => {
      const { updateSearchKeywords } = this.props;
      updateSearchKeywords(value);
    });
  }

  render() {
    const { searchKeywords } = this.state;

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

  handleReload = () => {
    const { reloadTable } = this.props;
    reloadTable();
  };

  handleChangeKeywords = e => {
    const { value } = e.target;
    this.setState({ searchKeywords: value });
    this.updateSearchKeywords(value);
  };
}

export default UserToolbar;
