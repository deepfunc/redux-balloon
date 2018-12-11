import React from 'react';
import classNames from 'classnames';
import { BackTop, Icon } from 'antd';
import MainSider from '@/containers/nav/MainSider';
import styles from './styles/index.less';

export default class Index extends React.Component {
  constructor(props) {
    super(props);

    this.mainMenuData = this.createMainMenuData();
  }

  createMainMenuData() {
    return [
      {
        key: '/userTable',
        name: 'Users Table',
        icon: 'table'
      }
    ];
  }

  render() {
    return (
      <div className={styles.root}>
        <BackTop visibilityHeight="344"/>
        <div className={styles.siderContainer}>
          <div className={styles.logo}>
            <a href="/">
              <span>Redux Balloon</span>
            </a>
          </div>
          <MainSider menuData={this.mainMenuData}/>
        </div>
        <div className={styles.mainContainer}>
          <div className={styles.header}>
            React Example
          </div>
        </div>
      </div>
    );
  }
}
