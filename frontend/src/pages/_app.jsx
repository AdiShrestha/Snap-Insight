import '../styles/globals.css'
// import {quicksand, dmSans, mulish} from '../fonts/fonts';
import { ConfigProvider } from 'antd';
import theme from '../theme/themeConfig';
import 'antd/dist/reset.css';
import { ThemeProvider } from "../context/ThemeContext";
import { Layout } from 'antd';
const App = ({ Component, pageProps }) => (
  

    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
);

export default App;