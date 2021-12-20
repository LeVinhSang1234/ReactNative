module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'require-context-hook',
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@/lib': './lib',
          '@/pages': './pages',
          '@/translate': './translate',
          '@/utils': './utils',
          '@/assets': './assets',
          '@/App': './App',
        },
      },
    ],
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
  ],
};
