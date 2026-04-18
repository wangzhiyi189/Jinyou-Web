
export function base64ToFile(base64String:string, filename:string, mimeType:string) {
  // 移除Base64前缀（如果有）
  const base64WithoutPrefix = base64String.split(',')[1] || base64String

  // 将Base64字符串转换为字节数组
  const byteCharacters = atob(base64WithoutPrefix)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  // 创建Blob对象并转换为File
  const blob = new Blob(byteArrays, { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}


export function fileToBase64(file:File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function parseCity(jsonStr:any) {
    // 1. 解析 JSON 字符串成数组
    const arr = JSON.parse(jsonStr);
    // 2. 截取关键字（去掉最后一个字的后缀，比如“省、市、县”）
    const formatArr = arr.map((item:any) => item.slice(0, -1));
    // 3. 用 "/" 拼接
    return formatArr.join('/');
}

/**
 * 计算两个时间字符串的间隔时长
 * @param {string} timeStr1 开始时间，格式：YYYY-MM-DD HH:mm
 * @param {string} timeStr2 结束时间，格式：YYYY-MM-DD HH:mm
 * @returns {Object} 包含各种格式的时间差
 */
export function getTimeInterval(timeStr1: string, timeStr2: string) {
  // 1. 把时间字符串转为 Date 对象（兼容所有浏览器）
  const parseDate = (str:string) => {
    const [datePart, timePart] = str.split(' ');
    const [year, month, day] = datePart?.split('-').map(Number);
    const [hour, minute] = timePart?.split(':').map(Number);
    // JS 月份从 0 开始，所以 month - 1
    return new Date(year, month - 1, day, hour, minute, 0);
  };

  const date1 = parseDate(timeStr1);
  const date2 = parseDate(timeStr2);

  // 2. 计算时间差（毫秒），取绝对值保证结果为正
  const diffMs = Math.abs(date2.getTime() - date1.getTime());

  // 3. 换算成各种单位
  const diffSeconds = Math.floor(diffMs / 1000); // 总秒数
  const diffMinutes = Math.floor(diffMs / (1000 * 60)); // 总分钟数
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60)); // 总小时数
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 总天数

  // 4. 格式化：天 时 分 秒
  const day = diffDays;
  const hour = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minute = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const second = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    diffMs,          // 总毫秒数
    diffSeconds,     // 总秒数
    diffMinutes,     // 总分钟数
    diffHours,       // 总小时数
    diffDays,        // 总天数
    format: `${day}天${hour}小时${minute}分钟${second}秒`, // 友好格式
    simpleFormat: `${hour}.${minute}` // 简化格式（不足1天用这个）
  };
}
