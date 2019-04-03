import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { BackTop } from 'antd';
import MainSider from '@/containers/nav/MainSider';
import UserManagement from '@/components/userManagement';
import styles from './styles/index.less';

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.mainMenuData = this.createMainMenuData();
  }

  createMainMenuData() {
    return [
      {
        key: '/userManagement',
        name: 'User Management',
        icon: 'team'
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
            React Examples
          </div>
          <div className={styles.contentContainer}>
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path="/userManagement" component={UserManagement}/>
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

const Home = () => (
  <p>
    This is react examples of Redux Balloon, click left menu to see results.
    Document is <a>Here</a>.
  </p>
);

export default Index;
