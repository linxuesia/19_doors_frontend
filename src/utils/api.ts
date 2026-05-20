import Taro from '@tarojs/taro';

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000/api'
  : 'https://api.19doors.com/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

async function request(url: string, options: RequestOptions = {}) {
  const { method = 'GET', data } = options;
  const token = Taro.getStorageSync('token');

  const header: any = { 'Content-Type': 'application/json' };
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header,
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data;
    }

    if (res.statusCode === 401) {
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('user');
      Taro.navigateTo({ url: '/subpackages/client/login/index' });
      throw new Error('未授权');
    }

    throw new Error((res.data as any)?.message || '请求失败');
  } catch (err: any) {
    if (err.errMsg?.includes('request:fail')) {
      throw new Error('网络连接失败');
    }
    throw err;
  }
}

const api = {
  get: (url: string, params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(url + query);
  },
  post: (url: string, data?: any) => request(url, { method: 'POST', data }),
  put: (url: string, data?: any) => request(url, { method: 'PUT', data }),
  del: (url: string) => request(url, { method: 'DELETE' }),
};

export default api;
