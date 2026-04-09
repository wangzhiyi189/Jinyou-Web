
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
