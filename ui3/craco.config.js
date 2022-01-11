const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const path = require('path');

module.exports = {
  // ...
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    plugins: [new AntdDayjsWebpackPlugin()],
  },
};
