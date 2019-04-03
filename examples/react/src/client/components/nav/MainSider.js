import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './styles/mainSider.less';

const SubMenu = Menu.SubMenu;

class MainSider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openKeys: []
    };
    this.rootSubmenuKeys = [];
  }

  componentDidMount() {
    const { menuData } = this.props;

    this.initRootSubmenuKeys(menuData);
  }

  initRootSubmenuKeys(menus) {
    menus.forEach(menu => {
      if (menu.children) {
        this.rootSubmenuKeys.push(menu.key);
      }
    });
  }

  createMenuItems(menuData) {
    return menuData.map(item => {
      const key = item.key;
      const to = item.to ? item.to : key;
      if (item.children) {
        return (
          <SubMenu
            {...item}
            key={key}
            title={
              <span>
                {item.icon && <Icon type={item.icon}/>}
                <span>{item.name}</span>
              </span>
            }
          >
            {this.createMenuItems(item.children)}
          </SubMenu>
        );
      } else {
        return (
          <Menu.Item {...item} key={key}>
            <Link to={to}>
              {item.icon && <Icon type={item.icon}/>}
              <span>{item.name}</span>
            </Link>
          </Menu.Item>
        );
      }
    });
  }

  render() {
    const { location: { pathname }, menuData, inlineCollapsed } = this.props;
    const { openKeys } = this.state;

    return (
      <div className={styles.root}>
        <Menu
          mode="inline"
          theme="dark"
          {...(((inlineCollapsed) => !inlineCollapsed ? { openKeys } : null)(inlineCollapsed))}
          selectedKeys={[pathname]}
          inlineCollapsed={inlineCollapsed}
        >
          {this.createMenuItems(menuData)}
        </Menu>
      </div>
    );
  }
}

export default MainSider;
