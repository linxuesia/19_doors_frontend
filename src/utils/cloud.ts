import Taro from '@tarojs/taro';

// 内存缓存：fileID → temp URL（避免重复请求 getTempFileURL）
const urlCache = new Map<string, { url: string; expiresAt: number }>();

/** 上传文件到微信云存储，返回 fileID（永久标识）和 cloudUrl（临时显示链接，2h有效） */
export function uploadFile(
  filePath: string,
  cloudPath: string,
): Promise<{ fileID: string; cloudUrl: string }> {
  return new Promise((resolve, reject) => {
    if (!Taro.cloud) {
      reject(new Error('云开发未初始化'));
      return;
    }
    Taro.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res: any) => {
        const fileID = res.fileID;
        Taro.cloud.getTempFileURL({
          fileList: [fileID],
          success: (urlRes: any) => {
            const cloudUrl = urlRes.fileList?.[0]?.tempFileURL || fileID;
            resolve({ fileID, cloudUrl });
          },
          fail: () => resolve({ fileID, cloudUrl: fileID }),
        });
      },
      fail: (err: any) => reject(new Error(err.errMsg || '上传失败')),
    });
  });
}

/** 批量上传图片，返回 cloudUrl 数组（可直接用作图片 src） */
export async function uploadImages(
  tempFiles: string[],
  folder: string = 'store-apply',
): Promise<{ fileID: string; cloudUrl: string }[]> {
  const results: { fileID: string; cloudUrl: string }[] = [];
  for (let i = 0; i < tempFiles.length; i++) {
    const timestamp = Date.now();
    const ext = tempFiles[i].split('.').pop() || 'jpg';
    const cloudPath = `${folder}/${timestamp}_${i}.${ext}`;
    const result = await uploadFile(tempFiles[i], cloudPath);
    results.push(result);
  }
  return results;
}

/** 将 cloud:// fileID 或 HTTP URL 解析为可显示的图片链接 */
export async function resolveImageUrl(src: string): Promise<string> {
  if (!src) return '';
  // 已经是 HTTP/HTTPS URL，直接返回
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // 不是 cloud://，直接返回原值
  if (!src.startsWith('cloud://')) return src;
  // 检查缓存
  const cached = urlCache.get(src);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  // 调用 getTempFileURL 转换
  return new Promise((resolve) => {
    if (!Taro.cloud) {
      resolve(src);
      return;
    }
    Taro.cloud.getTempFileURL({
      fileList: [src],
      success: (res: any) => {
        const url = res.fileList?.[0]?.tempFileURL || src;
        // 缓存 1.5 小时（实际有效期 2 小时，留 30 分钟余量）
        urlCache.set(src, { url, expiresAt: Date.now() + 90 * 60 * 1000 });
        resolve(url);
      },
      fail: () => resolve(src),
    });
  });
}

/** 批量解析 cloud:// 图片链接 */
export async function resolveImageUrls(srcs: string[]): Promise<string[]> {
  return Promise.all(srcs.map(resolveImageUrl));
}
