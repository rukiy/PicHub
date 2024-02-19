import { SettingConfig } from '../model/setting_config.model'
import { UploadTask } from '../model/upload_image.model'


const SETTING_CONFIG = 'setting_config'
const HISTORY ='history'

export const saveSettingConfig = (settingConfig: SettingConfig) => {
  localStorage.setItem(SETTING_CONFIG, JSON.stringify(settingConfig))
}
export const settingConfig = (): SettingConfig => {
  let settingConfig = null
  try {
    settingConfig = JSON.parse(localStorage.getItem(SETTING_CONFIG))
  } catch (e) {
  }

  if(!settingConfig){
    settingConfig = {
      // 黑暗模式
      isDark: false,
      // 是否压缩
      isCompress: true,
      // 重名名
      isReName: false
    }
  }
  return settingConfig
}

export const saveHistory = (uploadTasks: UploadTask[]) => {
  localStorage.setItem(HISTORY, JSON.stringify(uploadTasks))
}
export const history = (): UploadTask[] => {

  let history = null
  try {
    history = JSON.parse(localStorage.getItem(HISTORY))
  } catch (e) {
  }

  if(!history){
    history = []
  }

  return history
}

export const clear = () => {
  localStorage.removeItem(SETTING_CONFIG)
  localStorage.removeItem(HISTORY)
}

