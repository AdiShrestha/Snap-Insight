import { useState, useEffect } from "react";
import { Layout, Breadcrumb, theme } from 'antd';
import Sidebar from "../LeftSIdeBar";
import { getCurrentUser, isAuthenticated, logout } from "../../utils/auth";

const { Header, Content } = Layout;

const AppLayout = ({ children, breadcrumbItems, user }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setCurrentUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to get user data:', error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const defaultUser = currentUser || { name: 'Guest', email: '@guest' };
  const displayName = isLoggedIn ? defaultUser.name : 'Guest';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar 
        collapsed={collapsed} 
        onCollapse={setCollapsed} 
        user={defaultUser}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      <Content>
        <Header 
          style={{
            padding: 0,
            height: "2.5rem",
            background: "var(--color-bg-start)",
            boxShadow: "rgba(188, 188, 198, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px",
          }}
        >
           
         <div style={{
          backgroundColor: 'var(--color-bg-end)',
          height:'fit-content',
          width:'fit-content',
          padding:'0.4rem 1rem 0.4rem 0.3rem',
          borderRadius: '0  0.9rem 0  0.9rem',
          textAlign:"center",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 2px 0px",
         }}> <Breadcrumb
            style={{ color: 'var(--color-accent)', zIndex:4, marginLeft: '20px' }}
            separator=">"
            items={breadcrumbItems || [
              { title: 'Dashboard' },
              { title: `Welcome ${displayName}` },
            ]}
          />
          </div>
        </Header>
        
        <div
          style={{
            margin: '0 20px',
            minHeight: 600,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AppLayout;

