import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import api from '../utils/api';

export interface User {
  id: string;
  phone?: string;
  name: string;
  role: string;
  storeId?: string;
  avatarUrl?: string;
}

export const roleLabels: Record<string, string> = {
  CLIENT: '客户',
  STORE_OWNER: '老板',
  STORE_MANAGER: '店长',
  INSTALLER: '安装工',
  ADMIN: '管理员',
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  phoneLogin: (params: { phoneCode?: string; wxCode?: string; phone?: string }) => Promise<void>;
  wechatLogin: (role: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = Taro.getStorageSync('user');
    return saved || null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const saved = Taro.getStorageSync('token');
    return saved || null;
  });

  const saveAuth = useCallback((accessToken: string, u: User) => {
    setToken(accessToken);
    setUser(u);
    Taro.setStorageSync('token', accessToken);
    Taro.setStorageSync('user', u);
  }, []);

  const phoneLogin = useCallback(async (params: { phoneCode?: string; wxCode?: string; phone?: string }) => {
    const res: any = await api.post('/auth/phone-login', params);
    saveAuth(res.accessToken, res.user);
  }, [saveAuth]);

  const wechatLogin = useCallback(async (role: string) => {
    const loginRes = await Taro.login();
    if (!loginRes.code) throw new Error('微信登录失败');

    const res: any = await api.post('/auth/wechat-login', { code: loginRes.code, role });
    saveAuth(res.accessToken, res.user);
  }, [saveAuth]);

  const adminLogin = useCallback(async (username: string, password: string) => {
    const res: any = await api.post('/auth/admin-login', { username, password });
    saveAuth(res.accessToken, res.user);
  }, [saveAuth]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, phoneLogin, wechatLogin, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
