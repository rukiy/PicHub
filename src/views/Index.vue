<script setup lang="ts">
import { Alert } from '../util/alert'
import * as utils  from '../util/util'
import * as Config  from '../util/config'
import GithubAPI, { GithubFile, GithubFileData, GithubConfig } from '../api/GithubAPI'
import { ImageFile, UploadImageFile, UploadTask, UploadStatus } from '../model/upload_image.model'
import LewButton from '../components/base/LewButton.vue'
import axios from '../axios/http'
import { onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { generateGallery } from '../util/generateData'



const emit = defineEmits(['SetLoading', 'OpenUploadModel'])

const route = useRoute()
const router = useRouter()

watch(
  () => route.query,
  (n: any) => {
    if (n.folder) {
      GetImages(n.folder)
    }
  }
)

let uploadImageFiles = ref([] as UploadImageFile[])
let githubFiles = ref([] as GithubFile[])
let folder_file = null as GithubFile

onMounted(() => {
  if (githubConfig?.owner) {
    GetImages(route.query.folder)
  } else {
    router.push('/setting')
  }
})

let githubConfig: GithubConfig = GithubAPI.getConfig()

let imageExts = ['.png','.jpg','.jpeg','.bmp','.gif','.webp','.psd','.svg','.tiff']

const GetImages = (folderPath) => {
  folder_file = null
  emit('SetLoading', true)
  GithubAPI.listFiles(githubConfig.access_token, githubConfig.repoId, folderPath)
  .then((_githubFiles) => {
    githubFiles.value = _githubFiles
    emit('SetLoading', false)
    uploadImageFiles.value = []
    githubFiles.value.forEach((githubFile) => {
      let ext = utils.GetFileExt(githubFile.name)
      if(githubFile.name === `${folderPath}.json`){
        folder_file = githubFile
      } else if (githubFile.download_url && imageExts.includes(ext)) {
        let uploadImageFile = new UploadImageFile()
        uploadImageFile.copyGithubFile(githubFile)
        uploadImageFiles.value.unshift(uploadImageFile)
      }
    })
  })
  .catch(() => {
    emit('SetLoading', false)
  })
}


const generateGalleryData = async () => {
  emit('SetLoading', true)
  await generateGallery(route.query.folder,folder_file,uploadImageFiles.value)
  emit('SetLoading', false)
}

// 设置复制markdown
const copyMarkdownText = (uploadImageFile: UploadImageFile) => {
  let cdnURL = utils.GetCDNUrl(`${uploadImageFile.folder}/${uploadImageFile.name}${uploadImageFile.ext}`)
  utils.CopyByText(`![${uploadImageFile.name}/${uploadImageFile.ext}](${cdnURL})`)
}

// 设置复制cdn链接
const copyCDNText = (uploadImageFile: UploadImageFile) => {
  let cdnURL = utils.GetCDNUrl(`${uploadImageFile.folder}/${uploadImageFile.name}${uploadImageFile.ext}`)
  utils.CopyByText(cdnURL);
}

let loading = ref(false)
const DeleteForder = () => {
  if (githubFiles.value[0]?.name == 'init') {
    loading.value = true

    const fileData: GithubFileData = {
      message: 'delete init file',
      content: null,
      sha: githubFiles.value[0]?.sha,
    }
    const path = `${route.query.folder}/init`
    
    GithubAPI.deleteFile(githubConfig.access_token,githubConfig.owner,githubConfig.repoName,path, fileData)
    .then(() => {
      Alert({
        type: 'success',
        text: '删除成功',
      })
      loading.value = false
      router.push('/?reload=true')
    })
  } else {
    Alert({
      type: 'success',
      text: '该文件夹内有其他文件，请先登录Github中删除所有文件。',
    })
  }
}

const DeleteImage = (uploadImageFile: UploadImageFile) => {
  emit('SetLoading', true)

  const fileData: GithubFileData = {
    message: 'delete a image',
    content: null,
    sha: uploadImageFile.sha,
  }
  const path = `${route.query.folder}/${uploadImageFile.name}${uploadImageFile.ext}`
  
  GithubAPI.deleteFile(githubConfig.access_token,githubConfig.owner,githubConfig.repoName,path, fileData)
  .then(() => {
    Alert({
      type: 'success',
      text: '删除成功',
    })
    GetImages(route.query.folder)
  })
  .catch(() => {
    emit('SetLoading', false)
  })
}

const FormatWImageInfo = (uploadImageFile: UploadImageFile) => {
  return `
    <div class="image-info">
    <div class="item"><span>名称</span><div>${uploadImageFile.name}${uploadImageFile.ext}</div></div>
    <div class="item"><span>大小</span><div>${utils.GetFileSize(uploadImageFile.size)}</div></div>
    <div class="item"><span>url</span><div>${uploadImageFile.url}</div></div>
    <div class="item"><span>html_url</span><div>${uploadImageFile.html_url}</div></div>
    <div class="item"><span>git_url</span><div>${uploadImageFile.git_url}</div></div>
    <div class="item"><span>download_url</span><div>${uploadImageFile.download_url}</div> </div>
  `
}
const imgOnload = (e: any) => {
  let uploadImageFile = uploadImageFiles.value.find((uploadImageFile) => {
    return uploadImageFile.sha === e.target.id
  })
  uploadImageFile.width = e.target.width
  uploadImageFile.height = e.target.height
}


defineExpose({
  GetImages,
})
</script>

<template>
  <!-- 图片列表 -->
  <div class="index-wrapper">
    <div v-show="uploadImageFiles.length == 0" class="not-found">
      <div class="title">无图片</div>
      <div class="message">你可以在左侧栏底部上传图片。</div>
      <div style="margin-top: 10px">
        <LewButton
          @click="emit('OpenUploadModel')"
          type="primary"
          style="width: 120px; margin: 10px auto"
          >上传图片</LewButton
        >
        <LewButton
          @click="DeleteForder"
          type="danger"
          :loading="loading"
          style="width: 120px; margin: 0 auto"
          >删除文件夹</LewButton
        >
      </div>
    </div>

    <div v-show="uploadImageFiles.length > 0" class="list">
      <div v-for=" (uploadImageFile, index) in uploadImageFiles" :key="index" class="item">
        <div @click="DeleteImage(uploadImageFile)" class="del"></div>
        <a
          class="image"
          :data-info="FormatWImageInfo(uploadImageFile)"
          :href="uploadImageFile.getCDN()"
          data-fancybox="gallery"
        >
          <img :id="uploadImageFile.sha" :src="uploadImageFile.getCDN()" @load="imgOnload" loading="lazy" />
        </a>
        <div class="info">
          <div class="name">
            {{ `${uploadImageFile.name}${uploadImageFile.ext}`  }}
          </div>
          <div class="copy-box">
            <span
              class="copy-btn"
              @click="copyMarkdownText(uploadImageFile)"
              >markdown</span
            ><span
              class="copy-btn"
              @click="copyCDNText(uploadImageFile)"
              >cdn</span
            >
          </div>
        </div>
      </div>
    </div>
    <div v-if="uploadImageFiles.length > 0" class="footer">
      <lew-button type="gray" @click="generateGalleryData" style="height: 100%; width: 120px;">{{ uploadImageFiles.length }} images</lew-button>
    </div>
  </div>
</template>
<style>
.image-info .item {
  font-size: 14px;
  margin-bottom: 20px;
}
.image-info div {
  word-wrap: break-word;
  width: 100%;
}
.image-info div span {
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  color: #999;
}
</style>

<style lang="scss" scoped>
.index-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow-y: auto;

  box-sizing: border-box;
  .list {
    display: grid;
    align-content: flex-start;
    padding: 15px;
    grid-gap: 15px;
    min-height: calc(100vh - 73px);
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    list-style: none;
    .item {
      position: relative;
      height: 0;
      padding-bottom: 100%;
      background: var(--background-2);
      margin-bottom: 0px;
      border-radius: 12px;
      border: var(--border-width) rgba(247, 245, 245, 0) solid;
      overflow: hidden;
      cursor: pointer;
      .name {
        width: 80%;
        margin: 0 auto;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .image {
        position: absolute;
        left: 50%;
        top: calc(50% - 10px);
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        max-width: 80%;
        max-height: 100%;
        width: 80%;
        transition: all 0.1s;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 4px;
        }
      }
      .del {
        z-index: 1;
        position: absolute;
        left: 5px;
        top: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        border-radius: 50px;
        background: rgba($color: #d34343, $alpha: 0.25);
        opacity: 0;
        transition: all 0.1s;
        border: var(--border-width) rgba($color: #d34343, $alpha: 0.25) solid;
      }
      .del::after {
        width: 12px;
        height: 2px;
        content: '';
        border-radius: var(--border-width);
        background: rgba(175, 71, 71, 0.8);
      }
      .del:hover {
        background: rgba($color: #d34343, $alpha: 0.55);
      }
      .del:hover::after {
        background: rgba(190, 84, 84, 1);
      }
      .info {
        position: absolute;
        left: 0px;
        bottom: 0px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        transition: all 0.1s;
        width: 100%;
        font-size: 13px;
        color: var(--text-color-2);
        .copy-box {
          display: none;
          height: 40px;
          opacity: 0;
          transition: all 0.1s;
          span {
            padding: 2px 6px;
            border-radius: 4px;
            margin: 0px 3px;
            height: 20px;
            line-height: 20px;
            background: var(--background-3);
            border: var(--border-width) var(--border-color) solid;
          }
          span:hover {
            border: var(--border-width) var(--invert-background) solid;
            background: var(--invert-background);
            color: var(--invert-text-color);
          }
        }
      }
    }
    .item:hover {
      border: var(--border-width) var(--border-color) solid;
      .image {
        top: calc(50% - 20px);
      }
      .name {
        display: none;
      }
      .copy-box {
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 1;
      }
      .info {
        height: 40px;
        background-color: var(--background);
        color: var(--text-color);
      }
      .del {
        opacity: 1;
      }
    }
  }
  .footer {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: center;
    position: sticky;
    bottom: 0px;
    right: 0px;
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    text-align: center;
    color: var(--text-color-2);
    border-top: var(--border-width) var(--border-color) solid;
    // background: var(--background);
    background: var(--background-2);
    opacity: 0.7;
  }
  .not-found {
    position: absolute;

    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: var(--text-color-2);
    text-align: center;
    .title {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .message {
      font-size: 16px;
      margin-bottom: 55px;
    }
  }
}
</style>
