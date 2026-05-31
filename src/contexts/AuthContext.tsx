import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import api from '../utils/api';

export interface User {
  id: string;
  phone?: string;
  name: string;
  role: string;
  storeId?: string;
  storeName?: string;
  avatarUrl?: string;
}

export const roleLabels: Record<string, string> = {
  CLIENT: '客户',
  STORE_OWNER: '老板',
  STORE_MANAGER: '店长',
  INSTALLER: '安装工',
  ADMIN: '管理员',
};

export const BUSINESS_ROLES = ['STORE_OWNER', 'STORE_MANAGER', 'INSTALLER', 'ADMIN'];

interface AuthContextType {
  user: User | null;
  token: string | null;
  isBusiness: boolean;
  canManageStaff: boolean;
  requireBusinessLogin: (loginPage?: string) => boolean;
  requireLogin: (loginPage?: string) => boolean;
  phoneLogin: (params: { phoneCode?: string; wxCode?: string; phone?: string; avatarUrl?: string; nickname?: string }) => Promise<void>;
  wechatLogin: (role: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const phoneLogin = useCallback(async (params: { phoneCode?: string; wxCode?: string; phone?: string; avatarUrl?: string; nickname?: string }) => {
    const { avatarUrl, nickname, ...loginParams } = params;
    const res: any = await api.post('/auth/phone-login', {
      ...loginParams,
      ...(avatarUrl && { avatarUrl }),
      ...(nickname && { nickname: nickname.trim() }),
    });
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

  const refreshUser = useCallback(async () => {
    try {
      const res: any = await api.get('/auth/profile');
      if (res) {
        setUser(res);
        Taro.setStorageSync('user', res);
      }
    } catch {
      logout();
    }
  }, [logout]);

  const requireLogin = useCallback((loginPage?: string) => {
    if (!user || !token) {
      Taro.navigateTo({ url: loginPage || '/subpackages/client/login/index' });
      return false;
    }
    return true;
  }, [user, token]);

  const requireBusinessLogin = useCallback((loginPage?: string) => {
    if (!requireLogin(loginPage)) return false;
    const roles = (user!.role || '').split(',').filter(Boolean);
    if (!roles.some(r => BUSINESS_ROLES.includes(r))) {
      Taro.showToast({ title: '无权限访问', icon: 'none' });
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 1500);
      return false;
    }
    return true;
  }, [user, requireLogin]);

  const isBusiness = !!user && (user.role || '').split(',').some(r => BUSINESS_ROLES.includes(r));
  const canManageStaff = !!(user && ((user.role || '').includes('STORE_OWNER') || (user.role || '').includes('ADMIN')));

  return (
    <AuthContext.Provider value={{ user, token, isBusiness, canManageStaff, requireBusinessLogin, requireLogin, phoneLogin, wechatLogin, adminLogin, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
