import { defineStore } from "pinia";
export const welcomeCode = {
  html: "<h1 class='h1'>hello world</h1>",
  css: `.h1{
    color:purple
  }`,
  javascript: "console.log('hello world')",
};
// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useFileStore = defineStore("fileStore", {
  // other options...
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
      console.log(this.files);
    },
  },
});
