import {defineStore} from "pinia";


export const useErrorStore = defineStore('error', {
  state: () => ({
    consoleShow: false
  }),
  actions: {
    show() {
      window.eruda.init()
      this.consoleShow = true;
    },
    hide() {
      window.eruda.destroy();
      this.consoleShow = false;
    },
    changeConsole() {
      if (this.consoleShow) {
        this.hide();
      } else {
        this.show();
      }
    }
  }
})
