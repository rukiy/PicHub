import Compress from '@yireen/squoosh-browser'
import {
  defaultPreprocessorState,
  defaultProcessorState,
  encoderMap,
  EncoderState
} from '@yireen/squoosh-browser/dist/client/lazy-app/feature-meta'

enum CompressEncoderEnum {
  // eslint-disable-next-line no-unused-vars
  mozJPEG = 'mozJPEG',
  // eslint-disable-next-line no-unused-vars
  avif = 'avif',
  // eslint-disable-next-line no-unused-vars
  webP = 'webP'
}

/**
 * 判断是否需要压缩的图片格式
 * @param imageType
 */
const isNeedCompress = (imageType: string): boolean => {
  return /(png|jpg|jpeg|webp|avif)$/.test(imageType)
}

/**
 * 压缩图片
 * @param file
 * @param encoder
 */
const compressImage = async (file: File, encoder: CompressEncoderEnum) => {
  if (isNeedCompress(file.type)) {
    const compress = new Compress(file, {
      encoderState: {
        type: encoder,
        options: encoderMap[encoder].meta.defaultOptions
      } as EncoderState,
      processorState: defaultProcessorState,
      preprocessorState: defaultPreprocessorState
    })
    return compress.process()
  }

  return file
}


export {
  CompressEncoderEnum,
  compressImage
}