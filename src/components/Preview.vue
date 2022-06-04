<script setup>
import { onMounted } from "vue";

const preview = ref();
const sandBox = document.createElement("iframe");

onMounted(() => {
  sandBox.srcdoc = srcdoc;
  preview.value.appendChild(sandBox);
});
</script>

<template>
  <div id="preview" ref="preview"></div>
</template>

<style lang="scss" scoped>
#preview {
  border: 1px dashed black;
  height: 80vh;
  width: 50%;
  & :deep(iframe) {
    width: 100%;
    height: 100%;
    border: none;
    background-color: #fff;
  }
}
</style>
