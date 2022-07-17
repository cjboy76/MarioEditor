import { defineStore } from "pinia";

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
        compiled: {},
      };
      this.files[fileName] = newFile;
    },

    removeFile(fileName) {
      delete this.files[fileName];
    },

    updateCompiledFile(compiled, fileName) {
      this.files[fileName].compiled = compiled;
    },
  },
});

export const defaultMainFile = "App.vue";
