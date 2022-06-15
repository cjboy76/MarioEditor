import { defineStore } from "pinia";
export const welcomeCode = {
  html: "<h1 class='h1'>hello world</h1>",
  css: `.h1{
    color:purple
  }`,
  javascript: "console.log('hello world from MarioEditor')",
};

export const VueWelcomeCode = `<script setup>
import { ref } from 'vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg">
</template>

<style>
  h1 {
		color: red
  }
</style>
`;

export const useFileStore = defineStore("fileStore", {
  state: () => {
    return {
      files: {
        html: { index: welcomeCode["html"] },
        css: { index: welcomeCode["css"] },
        js: { index: welcomeCode["javascript"] },
      },
    };
  },
  actions: {
    updateFile(file, genre, name) {
      this.files[genre][name] = file;
    },
    removeFile(file) {
      const fileName = file.split(".");
      delete this.files[fileName[1]][fileName[0]];
    },
  },
});
