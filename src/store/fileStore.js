import { defineStore } from "pinia";
export const welcomeCode = {
  html: "<h1 class='h1'>hello world</h1>",
  css: `.h1{
    color:purple
  }`,
  javascript: "console.log('hello world from MarioEditor')",
};

export const useFileStore = defineStore("fileStore", {
  state: () => {
    return {
      files: {
        html: welcomeCode["html"],
        css: welcomeCode["css"],
        javascript: welcomeCode["javascript"],
      },
    };
  },
  actions: {
    updateFile(file, fileType) {
      this.files[fileType] = file;
    },
  },
});
