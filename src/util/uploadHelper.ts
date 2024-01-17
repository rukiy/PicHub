import { ImageFile, UploadImageFile, UploadTask, UploadStatus } from '../model/upload_image.model'
import * as utils from '../util/util'
import {compressImage,CompressEncoderEnum} from './compress-image'


const compressEncoder = CompressEncoderEnum.webP
// type可选 mozJPEG / avif / webP
const uploadHelper = (originalFile, folder) => {
  return new Promise<UploadTask>(async (resolve) => {

    const compressFile = await compressImage(originalFile, compressEncoder)
    const base64File: any = await fileByBase64(compressFile)
    const orginal_base64: any = await fileByBase64(originalFile)

    let orginal_ImageFile = new ImageFile()
    orginal_ImageFile.name = utils.GetFileName(originalFile.name),
    orginal_ImageFile.folder = folder,
    orginal_ImageFile.size = originalFile.size,
    orginal_ImageFile.ext = utils.GetFileExt(originalFile.name),
    orginal_ImageFile.base64 = orginal_base64

    let compress_ImageFile = new ImageFile()
    compress_ImageFile.name = orginal_ImageFile.name,
    compress_ImageFile.folder = folder,
    compress_ImageFile.size = compressFile.size,
    compress_ImageFile.ext = `.${compressEncoder}`.toLowerCase(),
    compress_ImageFile.base64 = base64File
    let uploadTask = new UploadTask()
    uploadTask.orginal = orginal_ImageFile
    uploadTask.compress = compress_ImageFile
    uploadTask.status = UploadStatus.ready
    uploadTask.newName = `${uploadTask.orginal.name}_${utils.createHash(6).toLowerCase()}`

    resolve(uploadTask) 
  })
}
/**
 * 上传附件转base64
 * @param {File} file 文件流
 */
const fileByBase64 = (file) => {
  return new Promise(async (resolve) => {
    var reader = new FileReader()
    // 传入一个参数对象即可得到基于该参数对象的文本内容
    reader.readAsDataURL(file)
    reader.onload = function (e: any) {
      // target.result 该属性表示目标对象的DataURL
      resolve(e.target.result)
    }
  })
}

export { uploadHelper, fileByBase64 }
