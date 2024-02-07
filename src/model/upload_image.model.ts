import * as utils from '../util/util'

class ImageFile {
  name: string
  folder: string
  size: number
  ext: string
  base64: string
  width: number
  height: number

  copy(imageFile: ImageFile) {
    this.name = imageFile.name
    this.folder = imageFile.folder
    this.size = imageFile.size
    this.ext = imageFile.ext
    this.base64 = imageFile.base64
    this.width = imageFile.width
    this.height = imageFile.height
  }

  getBase64data(): string {
    return this.base64.replace(/^data:image\/\w+;base64,/, '')
  }
}

class UploadImageFile extends ImageFile {

  copyGithubFile(githubFile: GithubResponceFile) {
    this.url = githubFile.url
    this.download_url = githubFile.download_url
    this.git_url = githubFile.git_url
    this.sha = githubFile.sha
    this.html_url = githubFile.html_url
    this.folder = utils.GetFileFolderPath(githubFile.path)
    this.name = utils.GetFileName(githubFile.name)
    this.ext = utils.GetFileExt(githubFile.name)
    this.size = githubFile.size
  }

  getCDN() {
    return utils.GetCDNUrl(`${this.folder}/${this.name}${this.ext}`)
  }

  download_url: string
  git_url: string
  html_url: string
  sha: string
  url: string
}

enum UploadStatus {
  ready,
  uploading,
  success,
  fail
}

class UploadTask {

  orginal: ImageFile
  compress: ImageFile
  upload: UploadImageFile
  status: UploadStatus
  newName: string
  isCompress: boolean
  isReName: boolean

}


interface GithubFile {
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


export {
  GithubFile,
  ImageFile,
  UploadImageFile,
  UploadTask,
  UploadStatus
}

