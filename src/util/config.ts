import { GithubConfig } from '../model/github_config.model'
import { SettingConfig } from '../model/setting_config.model'
import { UploadTask } from '../model/upload_image.model'

const GITHUB_CONFIG = 'github_config'
const SETTING_CONFIG = 'setting_config'
const HISTORY ='history'

export const saveGithubConfig = (githubConfig: GithubConfig) => {
  localStorage.setItem(GITHUB_CONFIG, JSON.stringify(githubConfig))
}

export const githubConfig = (): GithubConfig => {
  let githubConfig = null
  try {
    githubConfig = JSON.parse(localStorage.getItem(GITHUB_CONFIG))
  } catch (e) {
  }

  if(!githubConfig){
    githubConfig = {
      token: '',
      owner: '',
      repoId: '',
      repoName: '',
      repoBranch: '',
      name: '',
      avatarUrl: '',
      cdnRule: ''
    }
  }

  return githubConfig
}

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
  localStorage.removeItem(GITHUB_CONFIG)
  localStorage.removeItem(SETTING_CONFIG)
  localStorage.removeItem(HISTORY)
}

