import axios from '../axios/http'

const endpoint = 'https://gitee.com/api/v5/'
const access_token = '3fcf5de783ab24607904692740bfad6f'

const repositories = {
  owner: 'Rukiy',
  repoName: 'database'
}

export interface GiteeConfig {
  access_token: string
  owner: string
  repoId: string
  repoName: string
  repoBranch: string
  name: string
  avatarUrl: string
  cdnRule: string
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

const getFile = async (path: string): Promise<GiteeFile> => {
  return await axios.get({
    url: `${endpoint}repos/${repositories.owner}/${repositories.repoName}/contents/${path}?access_token=${access_token}`,
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
    url: `${endpoint}repos/${repositories.owner}/${repositories.repoName}/contents/${path}`,
    headers: {
      accept: 'application/json',
    },
    data: {
      access_token: `${access_token}`,
      content: content,
      message: `create ${path}`
    }
  })
}

const updateFile = async (path: string, content: string, sha: string) => {
  return await axios.put({
    url: `${endpoint}repos/${repositories.owner}/${repositories.repoName}/contents/${path}`,
    headers: {
      accept: 'application/json',
    },
    data: {
      access_token: `${access_token}`,
      content: content,
      sha: sha,
      message: `update ${path}`
    }
  })
}

export default {
  getFile, createFile, updateFile
}