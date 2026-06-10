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

      // 处理隐私授权事件（微信基础库 2.32.3+）
      if (typeof (Taro as any).onNeedPrivacyAuthorization === 'function') {
        (Taro as any).onNeedPrivacyAuthorization((resolve: any) => {
          console.log('[Privacy] 需要隐私授权，触发弹窗');
          // 调用 requirePrivacyAuthorize 触发微信原生隐私弹窗
          if (typeof (Taro as any).requirePrivacyAuthorize === 'function') {
            (Taro as any).requirePrivacyAuthorize({
              success: () => {
                console.log('[Privacy] 用户同意隐私协议');
                resolve({ event: 'agree', buttonId: 'agree' });
              },
              fail: () => {
                console.log('[Privacy] 用户拒绝隐私协议');
                resolve({ event: 'disagree' });
              },
            });
          } else {
            // 降级：直接 resolve agree
            resolve({ event: 'agree', buttonId: 'agree' });
          }
        });
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
