<script setup>
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { onMounted, ref, watchEffect } from "vue";
import { useFileStore, welcomeCode } from "./store/fileStore";
import srcdoc from "./assets/playground.html?raw";
import { debounce, stringFormat } from "./utils";

const preview = ref();

const fileStore = useFileStore();

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
let monacoEditor;
let sandBox = document.createElement("iframe");

onMounted(() => {
  sandBox.srcdoc = srcdoc;
  preview.value.appendChild(sandBox);

  monacoEditor = monaco.editor.create(document.getElementById("editor"), {
    value: welcomeCode["html"],
    language: "html",
    fontSize: "16px",
    theme: "vs-dark",
  });
  monacoEditor.getModel().onDidChangeContent(
    debounce(() => {
      fileStore.updateFile(monacoEditor.getValue(), selectLang.value);
      compileResult();
    }, 500)
  );
});
const compileResult = () => {
  let templateCode =
    `document.body.innerHTML = "${stringFormat(
      fileStore.$state.files["html"]
    )}";` +
    `${fileStore.$state.files["javascript"]};` +
    `window.__css = "${stringFormat(fileStore.$state.files["css"])}";` +
    `document.getElementById('playground_styles').innerHTML = window.__css;`;
  sandBox.contentWindow.postMessage(
    {
      action: "eval",
      code: templateCode,
    },
    "*"
  );
};

const selectLang = ref("html");
const selectLangHandler = () => {
  monaco.editor.setModelLanguage(monacoEditor.getModel(), selectLang.value);
  let content = fileStore.$state.files[selectLang.value] ?? "";
  monacoEditor.getModel().setValue(content);
};
</script>

<template>
  <button @click="compileResult">complie result</button>
  <select name="" id="" @change="selectLangHandler" v-model="selectLang">
    <option value="html">html</option>
    <option value="css">css</option>
    <option value="javascript">javascript</option>
  </select>
  <div id="LAONE">
    <div id="editor"></div>
    <div id="preview" ref="preview"></div>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100vw;
  height: 100vh;
  background: white;
}
#LAONE {
  display: flex;
  #editor {
    height: 80vh;
    width: 50vw;
  }
  #preview {
    height: 80vh;
    width: 50%;
    & iframe {
      width: 100%;
      height: 100%;
      border: 1px solid rgb(55, 55, 55);
      background-color: #fff;
    }
  }
}
</style>
