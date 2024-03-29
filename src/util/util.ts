import Moment from 'moment'
import axios from 'axios'
import Clipboard from 'clipboard'
import { Alert } from './alert'
import * as Config  from './config'
import GithubAPI, { GithubConfig } from '../api/GithubAPI'

export function createHash(hashLength: number) {
  // 默认长度 24
  return Array.from(Array(Number(hashLength) || 24), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('')
}

/**
 * 获取cdn url
 * @param path 
 * @returns 
 */
export function GetCDNUrl(path: String) {
  let github_config: GithubConfig = GithubAPI.getConfig()
  return github_config.cdnRule
  .replaceAll('{owner}', github_config.owner)
  .replaceAll('{repo}', github_config.repoName)
  .replaceAll('{branch}', github_config.repoBranch)
  .replaceAll('{path}', `${path}`)
}


/**
 * 人性化时间处理 传入国际时间格式
 */
export function GetBeautifyTime(date) {
  var newdate = Moment(date).format('yyyy-MM-DD HH:mm:ss')
  var timestamp = new Date(newdate).getTime()
  var mistiming = Math.round(new Date().getTime() / 1000) - timestamp / 1000
  var postfix = mistiming > 0 ? '前' : '后'

  mistiming = Math.abs(mistiming)
  var arrr = ['年', '个月', '星期', '天', '小时', '分钟', '秒']
  var arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1]
  for (var i = 0; i < 7; i++) {
    var inm = Math.floor(mistiming / arrn[i])
    if (inm != 0) {
      return inm + ' ' + arrr[i] + postfix
    }
  }
}

/**
 * 人性化时间处理 传入国际时间格式
 */
export function GetDate(date) {
  return Moment(date).format('yyyy年MM月DD日 HH:mm:ss')
}


/**
 * 获取文件所在目录
 * @param {String} filename 文件
 */
export function GetFileFolderPath(path: string) {
  return path.substring(0,path.lastIndexOf('/'))
}

/**
 * 获取文件名 无扩展名
 * @param {String} filename 文件
 */
export function GetFileName(filename) {
  return filename.substring(0, filename.lastIndexOf('.'))
}

/**
 * 得到文件的扩展名
 * @param {} filename
 */
export function GetFileExt(filename) {
  var d = /\.[^\.]+$/.exec(filename)
  var ext = new String(d)
  var s = ext.toLowerCase()
  return s
}


/**
 * 得到纯数字时间
 * @param {}
 */
export function GetNowTimeNum() {
  var nowTime: Date = new Date()
  var year: number = nowTime.getFullYear()
  var month: number = nowTime.getMonth() + 1
  var day: number = nowTime.getDate()
  var hour: number = nowTime.getHours()
  var minutes: number = nowTime.getMinutes()
  var seconds: number = nowTime.getSeconds()

  var hourStr: string = ''
  var minutesStr: string = ''
  var secondsStr: string = ''

  if (hour <= 9) {
    hourStr = '0' + hour.toString()
  }
  if (minutes <= 9) {
    minutesStr = '0' + minutes.toString()
  }
  if (seconds <= 9) {
    secondsStr = '0' + seconds.toString()
  }
  return year + month + day + hourStr + minutesStr + secondsStr
}

export function GetFileSize(size) {
  //把字节转换成正常文件大小
  if (!size) return ''
  var num = 1024.0 //byte
  if (size < num) return size + ' b'
  if (size < Math.pow(num, 2)) return (size / num).toFixed(2) + ' KB' //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + ' M' //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + ' G' //G
  return (size / Math.pow(num, 4)).toFixed(2) + ' T' //T
}

export function CopyByText(text: string) {
  var clipboard = new Clipboard('.copy-btn', {
    text: function (trigger) {
      return text
    }
  })
  clipboard.on('success', (e) => {
    // 复制成功消息通知
    Alert({
      type: 'success',
      text: '复制成功！',
    })
    clipboard.destroy()
  })
  clipboard.on('error', (e) => {
    // 复制失败消息通知
    Alert({
      type: 'danger',
      text: '复制失败！',
    })
    clipboard.destroy()
  })
}

export function CopyText() {
  var clipboard = new Clipboard('.copy-btn')
  clipboard.on('success', (e) => {
    // 复制成功消息通知
    Alert({
      type: 'success',
      text: '复制成功！',
    })
    clipboard.destroy()
  })
  clipboard.on('error', (e) => {
    // 复制失败消息通知
    Alert({
      type: 'danger',
      text: '复制失败！',
    })
    clipboard.destroy()
  })
}

export function FormatZhByMessage(text) {
  switch (true) {
    case text == 'Bad credentials': {
      return 'access token 错误'
    }
    case text.indexOf("wasn't supplied") >= 0: {
      return '请勿重复上传相同内容'
    }
    case text == 'This repository is empty.': {
      return '当前仓库为空，请新建一个文件夹'
    }
    case text == 'path cannot start with a slash': {
      return '名称不能为空'
    }
    case text == 'Requires authentication': {
      return 'access token 错误'
    }
    case text == 'Bad credentials': {
      return '未知错误'
    }
    default:
      return '未知错误'
  }
}

// export {
//   GetCDNUrl,
//   GetBeautifyTime,
//   GetFileName,
//   GetFileExt,
//   GetNowTimeNum,
//   GetDate,
//   GetFileSize,
//   CopyByText,
//   CopyText,
//   FormatZhByMessage,
// }
