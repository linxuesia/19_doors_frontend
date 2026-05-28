import Taro from '@tarojs/taro';

/** 上传文件到微信云存储，返回 fileID */
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
        // 转换 cloud:// 为临时链接
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

/** 批量上传图片到云存储，按 timestamp + index 命名 */
export async function uploadImages(
  tempFiles: string[],
  folder: string = 'store-apply',
): Promise<string[]> {
  const fileIDs: string[] = [];
  for (let i = 0; i < tempFiles.length; i++) {
    const timestamp = Date.now();
    const ext = tempFiles[i].split('.').pop() || 'jpg';
    const cloudPath = `${folder}/${timestamp}_${i}.${ext}`;
    const { fileID } = await uploadFile(tempFiles[i], cloudPath);
    fileIDs.push(fileID);
  }
  return fileIDs;
}
