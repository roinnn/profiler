const path = require('path');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

module.exports = {
  // ...
  babel: {
    plugins: [['import', { libraryName: 'antd', style: 'css' }]],
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    plugins: [new AntdDayjsWebpackPlugin()],
  },
};
