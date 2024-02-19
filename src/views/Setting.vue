<script setup lang="ts">
import { Alert } from '../util/alert'
import * as Config from '../util/config'
import {
  LewButton,
  LewFormItem,
  LewSwitch,
  LewInput,
  LewSelect,
} from '../components/base'
import { SettingConfig } from '../model/setting_config.model'
import GiteeAPI, { GiteeConfig }  from '../api/GiteeAPI'
import GithubAPI, { GithubUser, GithubRepo, GithubBranch, GithubConfig } from '../api/GithubAPI'

import { onMounted, reactive, ref } from 'vue'

const defaultCdnRule = 'https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}'

const repos = ref([] as GithubRepo[])
const branchs = ref([] as GithubBranch[])

let githubConfig: any = ref({} as GithubConfig)
let giteeConfig: any = ref({} as GiteeConfig)
let settingConfig: any = ref({} as SettingConfig)

let giteeConfigShow = ref(false)


let loading_1 = ref(false)
let loading_2 = ref(false)
let loading_3 = ref(false)

onMounted(() => {
  githubConfig.value = GithubAPI.getConfig()
  giteeConfig.value = GiteeAPI.getConfig()
  loadRepos()
  settingConfig.value = Config.settingConfig()
})

const loadRepos = async () => {
  const access_token = githubConfig.value.access_token
  if (!access_token) {
    return
  }
  loading_1.value = true
  // 获取用户
  GithubAPI.getUser(access_token).then((githubUser: GithubUser) => {

    githubConfig.value.owner = githubUser.owner
    githubConfig.value.name = githubUser.name
    githubConfig.value.avatarUrl = githubUser.avatarUrl

    // 获取仓库
    GithubAPI.getRepos(access_token, githubUser.owner)
      .then((githubRepos) => {
        repos.value = githubRepos
        
        // 选中仓库
        if(repos.value.length > 0){
          let currentRepo = githubRepos[0]
          if(githubConfig.value.repoId){
            currentRepo = repos.value.find((repo) => githubConfig.value.repoId == repo.id)
          }
          githubConfig.value.repoId = currentRepo.id
          githubConfig.value.repoName = currentRepo.name
          // 获取分支
          loadBranchs()
        }
      })
  }).catch(() => {
    
  }).finally(() => {
    loading_1.value = false
  })
}

const loadBranchs = async () => {
  const access_token = githubConfig.value.access_token
  const owner = githubConfig.value.owner
  const repoName = githubConfig.value.repoName
  if(repoName){
    GithubAPI.getBranchs(access_token, owner, repoName).then((githubBranchs) => {
      branchs.value = githubBranchs
      // 选中分支
      if(branchs.value.length > 0){
          let currentBranch = branchs.value.find((branch) => githubConfig.value.repoBranch == branch.name)
          if(!currentBranch){
            currentBranch = githubBranchs[0]
          }
          githubConfig.value.repoBranch = currentBranch.name
        }
    })
  }
}

const onRepoChange = async (repoId: number) => {
  const repo = repos.value.find((repo) => repoId == repo.id)
  githubConfig.value.repoName = repo.name
  loadBranchs()
}

const Save = () => {
  if (!githubConfig.value.repoId) {
    Alert({
      type: 'warning',
      text: '请选择仓库',
    })
    return
  }
  loading_2.value = true

  if (!githubConfig.value.cdnRule) {
    githubConfig.value.cdnRule = defaultCdnRule
  }

  GithubAPI.saveConfig(githubConfig.value)
  GiteeAPI.saveConfig(giteeConfig.value)
  Config.saveSettingConfig(settingConfig.value)

  setTimeout(() => {
    Alert({
      type: 'success',
      text: '保存成功！',
    })
    loading_2.value = false
    location.reload()
  }, 500)
}

const Exit = () => {
  
  Config.clear()
  GithubAPI.clearConfig()
  GiteeAPI.clearConfig()

  loading_3.value = true
  Alert({
    type: 'success',
    text: '退出成功',
  })
  setTimeout(() => {
    loading_3.value = false
    location.reload()
  }, 500)
}

const changeDarkModel = (e) => {
  if (e.target.checked) {
    document.getElementsByTagName('html')[0].classList.add('dark')
  } else {
    document.getElementsByTagName('html')[0].classList.remove('dark')
  }
}
</script>

<template>
  <div class="form">
    <div v-if="!githubConfig.name" class="title-1">开始</div>
    <div v-show="githubConfig.name" class="user-info">
      <img class="avatar" :src="githubConfig.avatarUrl" alt="" srcset="" />
      <div class="name">{{ githubConfig.name }}</div>
    </div>
    <div class="form">
      <lew-form-item title="Github access token" small_title="如何获取？"
        small_title_link="https://juejin.cn/post/6989307240633073700" :tips="repos.length == 0
            ? `注意： <br />Pichub不会对你的 access token
          进行储存和转移，它只会储存在你的本机的浏览器内，所以它是相对安全的。如果你试图去浏览器的缓存中清除掉它，你会发现，它需要重新登陆了，但我们不推荐这样操作。
         `
            : ''
          ">
        <lew-input :disabled="repos.length > 0" v-model="githubConfig.access_token" placeholder="请输入"></lew-input>
      </lew-form-item>

      <lew-form-item v-show="repos.length > 0" title="选择仓库">
        <lew-select  v-model="githubConfig.repoId" :option="repos" label="name" value="id" @on-change="onRepoChange(githubConfig.repoId)">
        </lew-select>
      </lew-form-item>

      <lew-form-item v-show="repos.length > 0" title="选择分支">
        <lew-select v-model="githubConfig.repoBranch" :option="branchs" label="name" value="name"></lew-select>
      </lew-form-item>
      <lew-form-item v-show="repos.length > 0" title="设置cdn模板">
        <lew-input v-model="githubConfig.cdnRule" :placeholder="defaultCdnRule"></lew-input>
      </lew-form-item>

      <!-- <lew-form-item direction="row" v-show="repos.length > 0" title="暗黑模式">
        <lew-switch v-model="settingConfig.isDark" @change="changeDarkModel"></lew-switch>
      </lew-form-item> -->

      <lew-form-item direction="row" v-show="repos.length > 0" title="配置gitee同步">
        <lew-switch v-model="giteeConfigShow"></lew-switch>
      </lew-form-item>
      <hr />
      <span v-if="repos.length > 0 && giteeConfigShow">
        <div class="title-2">Gitee配置</div>
        <lew-form-item title="access token">
          <lew-input v-model="giteeConfig.access_token" placeholder="请输入"></lew-input>
        </lew-form-item>
        <lew-form-item title="用户名">
          <lew-input v-model="giteeConfig.owner" placeholder="请输入"></lew-input>
        </lew-form-item>
        <lew-form-item title="仓库名">
          <lew-input v-model="giteeConfig.repoName" placeholder="请输入"></lew-input>
        </lew-form-item>
        <lew-form-item title="分支">
          <lew-input v-model="giteeConfig.repoBranch" placeholder="请输入"></lew-input>
        </lew-form-item>
      </span>
    </div>

    <lew-button type="primary" v-show="repos.length == 0" @click="loadRepos()" :loading="loading_1">
      确定
    </lew-button>
    <lew-button type="primary" v-show="repos.length > 0" @click="Save()" :loading="loading_2">
      保存配置
    </lew-button>
    <lew-button type="danger" v-show="repos.length > 0" @click="Exit()" :loading="loading_3">
      退出登录
    </lew-button>
  </div>
</template>
<style></style>

<style lang="scss" scoped>
.form {
  width: 400px;
  margin: 0px auto;
}

.title-1 {
  margin-top: 120px;
  margin-bottom: 20px;
  color: var(--text-color-1);
  font-weight: bold;
}

.title-1 {
  margin-top: 20px;
  margin-bottom: 25px;
  color: var(--text-color-1);
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 20px;
  padding: 20px 0px;

  .avatar {
    width: 150px;
    border-radius: 50%;
    border: var(--border-width) var(--border-color) solid;
  }

  .name {
    margin-top: 5px;
    font-size: 18px;
    line-height: 32px;
    margin-left: 10px;
    color: var(--text-color);
  }
}

.token-demo {
  width: 100%;
  background-color: rgb(243, 255, 245);
  border-radius: 14px;
  margin-bottom: 20px;
  padding: 15px;
  line-height: 30px;
}
</style>
