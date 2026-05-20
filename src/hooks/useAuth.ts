import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import api from '../utils/api';

export interface User {
  id: string;
  phone: string;
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = Taro.getStorageSync('user');
    return saved || null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const saved = Taro.getStorageSync('token');
    return saved || null;
  });

  const login = useCallback(async (phone: string, password: string) => {
    const res: any = await api.post('/auth/login', { phone, password });
    setToken(res.accessToken);
    setUser(res.user);
    Taro.setStorageSync('token', res.accessToken);
    Taro.setStorageSync('user', res.user);
  }, []);

  const register = useCallback(async (phone: string, password: string, name?: string, role?: string) => {
    const res: any = await api.post('/auth/register', { phone, password, name, role });
    setToken(res.accessToken);
    setUser(res.user);
    Taro.setStorageSync('token', res.accessToken);
    Taro.setStorageSync('user', res.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('user');
  }, []);

  return { user, token, login, register, logout };
}
