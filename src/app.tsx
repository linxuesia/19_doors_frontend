import { PropsWithChildren } from 'react';
import Taro, { useLaunch } from '@tarojs/taro';
import { AuthProvider } from './contexts/AuthContext';
import { REMIXICON_FONT_URL } from './assets/remixicon-font';
import './app.scss';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.');
    // 小程序通过JS API加载字体，比WXSS @font-face更可靠
    if (process.env.TARO_ENV === 'weapp') {
      Taro.loadFontFace({
        global: true,
        family: 'remixicon',
        source: REMIXICON_FONT_URL,
        success: () => console.log('Remix Icon font loaded'),
        fail: (err) => console.warn('Font load failed:', err),
      });
      // 初始化微信云开发（云存储）
      if (Taro.cloud) {
        Taro.cloud.init({ env: 'prod-d7g81p837f1219e28' });
      }
    }
  });

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default App;
