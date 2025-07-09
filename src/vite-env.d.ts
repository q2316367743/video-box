/// <reference types="vite/client" />
import {AxiosInstance} from "axios";

interface RouteMeta {
  hidden?: boolean;
  icon: JSX.Element;
}

interface OpenFileOption {
  title?: string,
  defaultPath?: string,
  buttonLabel?: string,
  filters?: { name: string, extensions: string[] }[],
  properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>,
  message?: string,
  securityScopedBookmarks?: boolean
}


declare global {


  type SubWindowChannel = 'player' | 'tv';

  interface SubWindow {

    receiveMsg<T = any>(callback: (msg: IpcEvent<T>) => void): void;

    sendMsg<T = any>(msg: IpcEvent<T>): void
  }

  interface IpcEvent<T = any> {
    event: string,
    data: T;
  }

  type ChannelName<C = SubWindowChannel> = `${C}:to` | `${C}:from`;

  interface Window {
    preload: {
      dialog: {

        /**
         * 打开一个文件，并返回File对象
         * @param options 参数
         * @return 返回File对象
         */
        openFile(options: OpenFileOption): Promise<File>,
        /**
         * 从url下载一个文件到指定目录
         * @param url 链接
         * @param path 要保存的文件路径，包含文件名
         */
        downloadFileFromUrl(url: string, path: string): Promise<void>,
        /**
         * 下载一个文件
         * @param data 文件内容，可以使blob(file)或ArrayBuffer或者链接或者DATA URL
         * @param name 文件名
         * @return 文件保存的路径
         */
        downloadFile(data: string | Blob | ArrayBuffer, name: string): Promise<string>
      },
      lib: {
        axiosInstance: AxiosInstance
      },
      ipcRenderer: {
        buildSubWindow(channel: SubWindowChannel): SubWindow;
        receiveMessage<T = any, C = SubWindowChannel>(channel: ChannelName<C>, callback: (msg: IpcEvent<T>) => void): void;
        sendMessage<T = any, C extends SubWindowChannel = SubWindowChannel>(id: number, channel: ChannelName<C>, message: IpcEvent<T>): void;
      }
    }
  }
}