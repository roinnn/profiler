import { ChakraProvider } from '@chakra-ui/react';
import { ConfigProvider } from 'antd';
import { render } from 'react-dom';
import App from './App';

render(
  <ChakraProvider>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </ChakraProvider>,
  document.getElementById('app'),
);
