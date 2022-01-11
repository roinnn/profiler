import { ChakraProvider } from '@chakra-ui/react';
import { ConfigProvider } from 'antd';
import { render } from 'react-dom';
import 'antd/dist/antd.css';
import App from './App';

render(
  <ChakraProvider>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </ChakraProvider>,
  document.getElementById('app'),
);
