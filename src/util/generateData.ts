import { Gallery, GalleryItem } from '../model/gallery.model'
import {  UploadImageFile,GithubFile } from '../model/upload_image.model'
import * as Config  from '../util/config'
import { Alert } from '../util/alert'
import axios from '../axios/http'
import { Base64 } from 'js-base64'
import  GiteeAPI  from '../api/GiteeAPI'
import GithubAPI, { GithubFileData, GithubConfig } from '../api/GithubAPI'



let githubConfig: GithubConfig = GithubAPI.getConfig()

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

    const fileData: GithubFileData = {
      message: `upload a folder.json (${folderPath}/${folderPath}.json)`,
      content: content,
      sha: null
    }
    if(githubFile){
      fileData.sha = githubFile.sha
    }

    const path = `${folderPath}/${folderPath}.json`


    let res = await GithubAPI.createFile(githubConfig.access_token,githubConfig.owner,githubConfig.repoName,path, fileData).catch(() => {
      Alert({
        type: 'danger',
        text: '生成json失败!',
      })
    })

    if(res){
      let giteeFile = await GiteeAPI.getFile(path)
      if(giteeFile){
        await GiteeAPI.updateFile(path,content,giteeFile.sha)
        .then((res: any) => {
          return res.data
        }).catch(() => {
          Alert({
            type: 'danger',
            text: '生成Gitee Json失败!',
          })
        })
      }else{
        await GiteeAPI.createFile(path,content).then((res: any) => {
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
  