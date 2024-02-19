import axios from '../axios/http'

export interface GithubConfig {
  access_token: string
  owner: string
  repoId: number
  repoName: string
  repoBranch: string
  name: string
  avatarUrl: string
  cdnRule: string
}

const GITHUB_CONFIG = 'github_config'
const endpoint = 'https://api.github.com'

const saveConfig = (_githubConfig: GithubConfig) => {
  localStorage.setItem(GITHUB_CONFIG, JSON.stringify(_githubConfig))
}

const getConfig = (): GithubConfig => {

  const str =  localStorage.getItem(GITHUB_CONFIG)
  if(str){
    return JSON.parse(localStorage.getItem(GITHUB_CONFIG))
  }else{
    return {
      access_token: '',
      owner: '',
      repoId: 0,
      repoName: '',
      repoBranch: '',
      name: '',
      avatarUrl: '',
      cdnRule: ''
    }
  }
}

const clearConfig = () => {
  localStorage.removeItem(GITHUB_CONFIG)
}

/**
 * 获取用户
 */
export interface GithubUser {
  owner: string
  name: string
  avatarUrl: string
}
const getUser = async ( access_token: string ): Promise<GithubUser> => {
  return axios.get<GithubUser>({
    url: `${endpoint}/user`,
    headers: {
      Authorization: `token ${access_token}`,
    }
  }).then((res: any) => {
    return {
      owner: res.data.login,
      name: res.data.name,
      avatarUrl: res.data.avatar_url
    }
  })
}

/**
 * 获取用户所有仓库
 */
export interface GithubRepo {
  id: number
  name: string
}
const getRepos = async ( access_token: string , owner: string): Promise<GithubRepo[]> => {
  return axios.get<GithubRepo[]>({
    url: `${endpoint}/users/${owner}/repos?type=public&sort=created&per_page=100`,
    headers: {
      Authorization: `token ${access_token}`,
    },
  }).then((res: any) => {
    const repos = []
    res.data.forEach((value, index, array) => {
      // val: 当前值
      // idx：当前index
      // array: Array
      repos.push({
        id: value.id,
        name: value.name,
      })
    })
    return repos
  })
}

/**
 * 获取仓库所有分支
 */
export interface GithubBranch{
  name: string
}
const getBranchs = async (access_token: string, repoOwner: string, repoBranch: string): Promise<GithubBranch[]> => {
  return axios.get<GithubBranch[]>({
    url: `${endpoint}/repos/${repoOwner}/${repoBranch}/branches`,
    headers: {
      Authorization: `token ${access_token}`,
    }
  }).then((res: any) => {
    const branchs = []
    res.data.forEach((value, index, array) => {
      // val: 当前值
      // idx：当前index
      // array: Array
      branchs.push({
        name: value.name
      })
    })
    return branchs
  })
}

/**
 * 获取文件列表
 */
export interface GithubFile{
  download_url: string
  git_url: string
  html_url: string
  name: string
  path: string
  sha: string
  size: number
  type: string
  url: string
}
const listFiles = async (access_token: string, repoId: number, path: string): Promise<GithubFile[]> => {
  return axios.get<GithubFile[]>({
    url: `${endpoint}/repositories/${repoId}/contents/${ path || ''}?t=${new Date().getTime()}`,
    headers: {
      Authorization: `token ${access_token}`,
    }
  }).then((res: any) => {
    return res.data
  })
}


/**
 * 上传文件
 */
export interface GithubFileData {
  message: string
  content: string
  sha: string
}
const createFile = async (access_token: string,repoOwner: string, repoName: string,  path: string, fileData: GithubFileData) => {
  return axios.put({
    url: `${endpoint}/repos/${repoOwner}/${repoName}/contents/${path}`,
    headers: {
      Authorization: `token ${access_token}`,
    },
    data: fileData
  }).then((res: any) => {
    return res.data
  })
}

const deleteFile = async (access_token: string,repoOwner: string, repoName: string,  path: string, fileData: GithubFileData) => {
  return axios.delete({
    url: `${endpoint}/repos/${repoOwner}/${repoName}/contents/${path}`,
    headers: {
      Authorization: `token ${access_token}`,
    },
    data: fileData
  }).then((res: any) => {
    return res.data
  })
}


export default {
  getConfig, saveConfig, clearConfig,
  getUser, getRepos, getBranchs, listFiles, createFile, deleteFile
}