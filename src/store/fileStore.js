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
      files: {},
    };
  },
  actions: {
    updateFile(file, fileName) {
      if (this.files[fileName]) {
        this.files[fileName].code = file;
        return;
      }
      const newFile = {
        code: file,
      };
      this.files[fileName] = newFile;
    },

    removeFile(fileName) {
      delete this.files[fileName];
    },
  },
});

export const defaultMainFile = "App.vue";
