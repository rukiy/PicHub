import { Gallery, GalleryItem } from '../model/gallery.model'
import {  UploadImageFile,GithubFile } from '../model/upload_image.model'
import { GithubConfig } from '../model/github_config.model'
import * as Config  from '../util/config'
import * as utils from '../util/util'
import { Alert } from '../util/alert'
import axios from '../axios/http'
import { Base64 } from 'js-base64'
import giteeAPI from '../api/GiteeAPI'


let github_config: GithubConfig = Config.githubConfig()


const generateGallery = async (folderPath ,githubFile: GithubFile ,uploadImageFiles: UploadImageFile[]) => {
  const galleryItems: GalleryItem[] = []
    uploadImageFiles.forEach( (uploadImageFile) =>{
      galleryItems.push({
        name: uploadImageFile.name,
        folder: uploadImageFile.folder,
        sha: uploadImageFile.sha,
        size: uploadImageFile.size,
        url: uploadImageFile.download_url,
        width: uploadImageFile.width,
        height: uploadImageFile.height
      })
    })
    const json = JSON.stringify(galleryItems)
    const content = Base64.encode(json)


    const data = {
      message: `upload a folder.json (${folderPath}/${folderPath}.json)`,
      content: content
    }
    if(githubFile){
      data['sha'] = githubFile.sha
    }
    const path = `${folderPath}/${folderPath}.json`
    let res = await axios.put({
      url: `https://api.github.com/repos/${github_config.owner}/${github_config.repoName}/contents/${path}`,
      headers:{
        accept : 'application/json',
        Authorization: `token ${Config.githubConfig().token}`,
      },
      data: data
    }).then((res: any) => {
      return res.data
    }).catch(() => {
      Alert({
        type: 'danger',
        text: '生成json失败!',
      })
    })
    if(res){
      let giteeFile = await giteeAPI.getFile(path)
      if(giteeFile){
        await giteeAPI.updateFile(path,content,giteeFile.sha)
        .then((res: any) => {
          return res.data
        }).catch(() => {
          Alert({
            type: 'danger',
            text: '生成Gitee Json失败!',
          })
        })
      }else{
        await giteeAPI.createFile(path,content).then((res: any) => {
          return res.data
        }).catch(() => {
          Alert({
            type: 'danger',
            text: '生成Gitee Json失败!',
          })
        })
      }
    }
}

export { generateGallery }
  