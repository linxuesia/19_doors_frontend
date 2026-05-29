import Taro from '@tarojs/taro';

// 云托管配置（生产环境走 callContainer，无需域名/备案/白名单）
const CLOUD_ENV = 'attblqgz';
const SERVICE_NAME = 'sojoy-api';

// develop(DevTools) → 本地后端；trial/release → 云托管 callContainer
const getEnv = () => {
  try {
    return Taro.getAccountInfoSync?.()?.miniProgram?.envVersion;
  } catch { return 'develop'; }
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

function handleResponse(res: { statusCode: number; data: any }) {
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
}

async function devRequest(url: string, options: RequestOptions = {}) {
  const { method = 'GET', data, header: extraHeader } = options;
  try {
    const res = await Taro.request({
      url: `http://localhost:3000/api${url}`,
      method,
      data,
      header: { 'Content-Type': 'application/json', ...extraHeader },
    });
    return handleResponse(res);
  } catch (err: any) {
    if (err.errMsg?.includes('request:fail')) {
      throw new Error('网络连接失败');
    }
    throw err;
  }
}

async function cloudRequest(url: string, options: RequestOptions = {}) {
  const { method = 'GET', data, header: extraHeader } = options;
  try {
    const res = await Taro.cloud.callContainer({
      config: { env: CLOUD_ENV },
      path: `/api${url}`,
      method: method as any,
      header: {
        ...extraHeader,
        'Content-Type': 'application/json',
        'X-WX-SERVICE': SERVICE_NAME,
      },
      data,
    });
    return handleResponse(res);
  } catch (err: any) {
    if (err.errMsg?.includes('callContainer:fail') || err.errMsg?.includes('container:fail')) {
      throw new Error('网络连接失败');
    }
    throw err;
  }
}

async function request(url: string, options: RequestOptions = {}) {
  const token = Taro.getStorageSync('token');

  const authHeader: any = {};
  if (token) {
    authHeader['Authorization'] = `Bearer ${token}`;
  }

  if (getEnv() === 'develop') {
    return devRequest(url, { ...options, header: { ...options.header, ...authHeader } });
  }

  return cloudRequest(url, { ...options, header: { ...options.header, ...authHeader } });
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
