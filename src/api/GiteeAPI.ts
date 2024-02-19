import axios from '../axios/http'

export interface GiteeConfig {
  access_token: string
  owner: string
  repoName: string
  repoBranch: string
}


interface GiteeFile {
  type: string
  encoding: string
  size: number
  name: string
  path: string
  content: string
  sha: string
  url: string
  html_url: string
  download_url: string
}


const GITEE_CONFIG = 'gitee_config'
const endpoint = 'https://gitee.com/api/v5/'

const saveConfig = (_giteeConfig: GiteeConfig) => {
  localStorage.setItem(GITEE_CONFIG, JSON.stringify(_giteeConfig))
  giteeConfig = _giteeConfig
}

const getConfig = (): GiteeConfig => {
  let giteeconfig = null
  try {
    giteeconfig = JSON.parse(localStorage.getItem(GITEE_CONFIG))
  } catch (e) {
  }

  if(!giteeconfig){
    giteeconfig = {
      access_token: '',
      owner: '',
      repoName: '',
      repoBranch: ''
    }
  }
  return giteeconfig
}

const clearConfig = () => {
  localStorage.removeItem(GITEE_CONFIG)
}

let giteeConfig: GiteeConfig = getConfig()

const getFile = async (path: string): Promise<GiteeFile> => {
  return await axios.get({
    url: `${endpoint}repos/${giteeConfig.owner}/${giteeConfig.repoName}/contents/${path}?ref=${giteeConfig.repoBranch}&access_token=${giteeConfig.access_token}`,
    headers: {
      accept: 'application/json'
    }
  }).then((res: any) => {
    if(res.data.length === 0){
      return null
    }
    return res.data
  })
}

const createFile = async (path: string, content: string) => {
  return await axios.post({
    url: `${endpoint}repos/${giteeConfig.owner}/${giteeConfig.repoName}/contents/${path}`,
    headers: {
      accept: 'application/json',
    },
    data: {
      branch: giteeConfig.repoBranch,
      access_token: giteeConfig.access_token,
      content: content,
      message: `create ${path}`
    }
  })
}

const updateFile = async (path: string, content: string, sha: string) => {
  return await axios.put({
    url: `${endpoint}repos/${giteeConfig.owner}/${giteeConfig.repoName}/contents/${path}`,
    headers: {
      accept: 'application/json',
    },
    data: {
      branch: giteeConfig.repoBranch,
      access_token: giteeConfig.access_token,
      content: content,
      sha: sha,
      message: `update ${path}`
    }
  })
}

export default {
  saveConfig, getConfig, clearConfig, getFile, createFile, updateFile
}