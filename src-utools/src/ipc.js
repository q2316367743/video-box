const {ipcRenderer} = require('electron');

/**
 * 接收消息发过来的消息
 * @param event {string} 事件
 * @param callback {(msg: string) => void} 接收消息回调
 */
function receiveMessage(event, callback) {
  ipcRenderer.on(event, (_event, res) => {
    if (callback) {
      callback(res);
    }
  })
}

/**
 * 发送消息给指定窗口
 * @param id {number} 窗口id
 * @param channel {string} 消息通道
 * @param message {string} 消息内容
 */
function sendMessage(id, channel, message) {
  ipcRenderer.sendTo(id, channel, message);
}

class SubWindow {

  constructor(channel) {
    this.channel = channel;
  }

  /***  接收主窗口发送过来的消息  ***/
  receiveMsg(callback) {
    ipcRenderer.on(this.channel + ':to', (event, res) => {
      // 保存插件的窗口ID
      this.parentId = event.senderId;
      if (res) {
        callback(res);
      }
    })
  }

  /***  向插件主窗口发送消息  ***/
  sendMsg(msg) {
    // 优先使用新的API
    if (utools.sendToParent) {
      utools.sendToParent(this.channel + ':from', msg);
      return;
    }
    if (this.parentId) {
      ipcRenderer.sendTo(this.parentId, this.channel + ':from', msg);
    }
  }
}


function buildSubWindow(channel) {
  return new SubWindow(channel);
}

module.exports = {receiveMessage, sendMessage, buildSubWindow};