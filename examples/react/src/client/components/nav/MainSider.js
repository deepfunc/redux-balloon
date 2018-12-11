import React from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import styles from './styles/mainSider.less';

const SubMenu = Menu.SubMenu;
const OPENKEYS_KEYNAME = 'mainSider.openKeys';

export default class MainSider extends React.PureComponent {
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
    this.initOpenKeys();
  }

  initRootSubmenuKeys(menus) {
    menus.forEach(menu => {
      if (menu.children) {
        this.rootSubmenuKeys.push(menu.key);
      }
    });
  }

  initOpenKeys() {
    const { location: { pathname }, menuData } = this.props;
    let openKeys = [];

    const deepLookup = (parentKeys, data) => {
      for (const item of data) {
        const key = item.key;
        const children = item.children;

        if (key === pathname) {
          openKeys = parentKeys;
          return;
        } else if (children) {
          deepLookup(parentKeys.concat([key]), children);
        }
      }
    };

    for (const firstLevel of menuData) {
      const key = firstLevel.key;
      const children = firstLevel.children;

      if (children) {
        deepLookup([key], children);
      }
    }

    if (openKeys.length === 0) {
      const defaultOpenKeys = this.props.defaultOpenKeys || [];
      const savedOpenKeys = this.loadSavedOpenKeys();
      if (savedOpenKeys.length > 0) {
        openKeys = savedOpenKeys;
      } else {
        openKeys = defaultOpenKeys;
      }
    }

    this.setState({ openKeys });
  }

  loadSavedOpenKeys() {
    let result = [];

    if (localStorage) {
      const saved = localStorage.getItem(OPENKEYS_KEYNAME);
      if (saved) {
        result = JSON.parse(saved);
      }
    }

    return result;
  }

  saveOpenKeys(openKeys) {
    if (localStorage) {
      localStorage.setItem(OPENKEYS_KEYNAME, JSON.stringify(openKeys));
    }
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

  filterPermissionMenu(menu, permissions) {
    function hasPermission(name) {
      return permissions.find(value => value === name) !== undefined;
    }

    function filterMenu(menu) {
      return menu.reduce((pre, cur) => {
        if (!cur.permission || hasPermission(cur.permission)) {
          if (cur.children) {
            cur.children = filterMenu(cur.children);
          }
          return pre.concat([cur]);
        } else {
          return pre;
        }
      }, []);
    }

    let result = filterMenu(menu);
    if (result.size === 0) {
      result = result.push({
        key: 'null',
        name: '没有菜单权限',
        icon: 'close',
        disabled: true
      });
    }
    return result;
  }

  onOpenChange = (openKeys) => {
    const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
    let result;

    if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      result = openKeys;
    } else {
      result = latestOpenKey ? [latestOpenKey] : [];
    }

    this.setState({ openKeys: result }, () => this.saveOpenKeys(this.state.openKeys));
  };

  render() {
    const { location: { pathname }, menuData, inlineCollapsed } = this.props;
    const { openKeys } = this.state;

    // const filterMenu = this.filterPermissionMenu(menuData, permissions);

    return (
      <div className={styles.root}>
        <Menu
          mode="inline"
          theme="dark"
          {...(((inlineCollapsed) => !inlineCollapsed ? { openKeys } : null)(inlineCollapsed))}
          selectedKeys={[pathname]}
          inlineCollapsed={inlineCollapsed}
          onOpenChange={this.onOpenChange}
        >
          {this.createMenuItems(menuData)}
        </Menu>
      </div>
    );
  }
}
