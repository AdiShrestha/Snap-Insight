"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  UserOutlined,
  RobotOutlined,
  TeamOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Menu, Layout, Breadcrumb } from 'antd';
import { useTheme } from '../context/ThemeContext';


const { Sider,Header,Footer, Content } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const Sidebar = ({ collapsed, onCollapse, user, isLoggedIn, onLogout }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeComponent, setActiveComponent] = useState('main');

  useEffect(() => {
    const module = searchParams.get('module');
    const section = searchParams.get('section');
    if (module) {
      setActiveComponent(module);
    } else if (section) {
      setActiveComponent(section);
    } else {
      setActiveComponent('main');
    }
  }, [searchParams]);

  // Update breadcrumb based on active component
  const getBreadcrumbItems = () => {
    switch (activeComponent) {
      case 'shopping':
        return [{ title: 'Module' }, { title: 'Shopping' }];
      case 'cooking':
        return [{ title: 'Module' }, { title: 'Cooking' }];
      // case 'news':
      //   return [{ title: 'Module' }, { title: 'News' }];
      case 'travel':
        return [{ title: 'Module' }, { title: 'Travel' }];
      case 'thisweek':
        return [{ title: 'History' }, { title: 'This Week' }];
      case 'thismonth':
        return [{ title: 'History' }, { title: 'This Month' }];
      case 'chat':
        return [{ title: 'Chat' }, { title: 'AI Chat' }];
      default:
        return [{ title: 'Dashboard' }, { title: `Welcome ${user.name || 'Guest'}` }];
    }
  };

  const handleClick = (e) => {
    const key = e.key;
    
    // Handle logout
    if (key === 'logout') {
      onLogout();
      return;
    }
    
    const routeMap = {
      '3': '/home/dashboard', // Username click goes to dashboard
      '5': '/history/thisweek',
      '7': '/history/thismonth',
      '9': '/chat/page',
      '6': '/module/shopping',
      '8': '/module/cooking',
      // '10': '/module/news',
      '11': '/module/travel',
    };

    if (routeMap[key]) {
      router.push(routeMap[key]);
      
      
      switch (key) {
        case '3':
          setActiveComponent('main');
          break;
        case '5':
          setActiveComponent('thisweek');
          break;
        case '7':
          setActiveComponent('thismonth');
          break;
        case '9':
          setActiveComponent('chat');
          break;
        case '6':
          setActiveComponent('shopping');
          break;
        case '8':
          setActiveComponent('cooking');
          break;
        // case '10':
        //   setActiveComponent('news');
        //   break;
        case '11':
          setActiveComponent('travel');
          break;
        default:
          setActiveComponent('main');
      }
    }
  };

  const { theme, toggleTheme } = useTheme();

  const userMenuItems = isLoggedIn 
    ? [
        getItem(`${user.name || 'User'}`, '3'),
        getItem('Logout', 'logout', <LogoutOutlined />)
      ]
    : [
        getItem('Guest Mode', '3')
      ];

  const items = [
    getItem('User', 'sub1', <UserOutlined />, userMenuItems),
    getItem('History', 'sub0', <DesktopOutlined />, [
      getItem('This Week', '5'),
      getItem('This Month', '7'),
    ]),
    getItem('Chat', 'sub2', <RobotOutlined />, [
      getItem('Chat with AI', '9'),
    ]),
    getItem('Module', 'sub3', <TeamOutlined />, [
      getItem('Shopping', '6'),
      getItem('Cooking', '8'),
      // getItem('News', '10'),
      getItem('Travel', '11'),
    ]),
  ];

  return (
    <>
    <Sider
      style={{ padding: 0, background: "var(--color-bg-start)" }}
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={240}
      z-index={1000}
    >    
      <div className="demo-logo-vertical" />
      <h2 style={{ margin: '0.8rem 1.2rem' }} className="logo-text">
        <span style={{ color: "white" }}>Snap</span>
        <span style={{ color: "var(--color-subtext)" }}>Insight</span>
      </h2>
      
      <Menu
        theme="dark"
        style={{ backgroundColor: "var(--color-nav-bar)" }}
        defaultSelectedKeys={['3']} 
        mode="inline"
        items={items}
        onClick={handleClick}
      />
    </Sider>                
    </>
  );
};

export default Sidebar;