<script setup>
// import { Repl } from "@vue/repl";
// import "@vue/repl/style.css";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { onMounted, ref } from "vue";
import { useFileStore, welcomeCode } from "./store/fileStore";
import srcdoc from "./assets/playground.html?raw";
import { debounce } from "./utils";

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
      let rmNewlinesFile = monacoEditor.getValue().replace(/\r?\n|\r/g, "");
      fileStore.updateFile(rmNewlinesFile, selectLang.value);
      compileResult();
    }, 500)
  );
});

const compileResult = () => {
  let templateCode =
    `document.body.innerHTML = "${fileStore.$state.files["html"]}";` +
    fileStore.$state.files["javascript"];
  sandBox.contentWindow.postMessage(
    {
      action: "eval",
      code: templateCode,
    },
    "*"
  );
  sandBox.contentWindow.postMessage(
    {
      action: "style",
      code: fileStore.$state.files["css"],
    },
    "*"
  );
};

// const previousLang = ref("");
const selectLang = ref("html");
// previousLang.value = selectLang.value;
const selectLangHandler = () => {
  // fileStore.updateFile(monacoEditor.getValue(), previousLang.value);
  monaco.editor.setModelLanguage(monacoEditor.getModel(), selectLang.value);
  let content = fileStore.$state.files[selectLang.value] ?? "";
  monacoEditor.getModel().setValue(content);
  // previousLang.value = selectLang.value;
};
</script>

<template>
  <!-- <Repl /> -->
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
#LAONE {
  display: flex;
  #editor {
    border: 1px dashed rebeccapurple;
    height: 100vh;
    width: 50vw;
  }
  #preview {
    border: 1px dashed black;
    height: 100vh;
    width: 50%;
    & :deep(iframe) {
      width: 100%;
      height: 100vh;
      border: none;
      background-color: #fff;
    }
  }
}
</style>
