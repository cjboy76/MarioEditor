<script setup>
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { computed, onMounted, ref } from "vue";
import { useFileStore, welcomeCode } from "./store/fileStore";
import srcdoc from "./assets/playground.html?raw";
import { debounce, stringFormat, filesFormat } from "./utils";

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
      fileStore.updateFile(
        monacoEditor.getValue(),
        activeFileName.value[1],
        activeFileName.value[0]
      );
      compileResult();
    }, 500)
  );
});
const compileResult = () => {
  let templateCode =
    `document.body.innerHTML = "${filesFormat(
      fileStore.$state.files["html"]
    )}";` +
    `${filesFormat(fileStore.$state.files["js"], true)}` +
    `window.__css = "${filesFormat(fileStore.$state.files["css"])}";` +
    `document.getElementById('playground_styles').innerHTML = window.__css;`;
  sandBox.contentWindow.postMessage(
    {
      action: "eval",
      code: stringFormat(templateCode),
    },
    "*"
  );
};

const setEditorContent = () => {
  monaco.editor.setModelLanguage(
    monacoEditor.getModel(),
    activeFileName.value[1] === "js" ? "javascript" : activeFileName.value[1]
  );
  let content =
    fileStore.$state.files[activeFileName.value[1]][activeFileName.value[0]] ??
    "";
  monacoEditor.getModel().setValue(content);
};

const filesSystem = ref([
  { name: "index.html" },
  { name: "index.css" },
  { name: "index.js" },
]);
let activeFile = ref("index.html");
let activeFileName = computed(() => {
  return activeFile.value.split(".");
});
const selectFile = ({ name }) => {
  activeFile.value = name;
  setEditorContent();
};
const pending = ref(false);
const addFileStart = () => {
  pending.value = true;
};
const addFileDone = () => {
  if (!pending.value) return;
  const fileName = placeholder.value;
  if (!/\.(js|css)$/.test(fileName)) {
    console.log("file type not allowed.");
    return;
  }
  console.log("good");
  addFileCancel();
  filesSystem.value.push({ name: fileName });
  selectFile({ name: fileName });
};
const addFileCancel = () => {
  placeholder.value = "Sample.js";
  pending.value = false;
};
const placeholder = ref("Sample.js");
</script>

<template>
  <div id="LAONE">
    <div class="editor">
      <div class="file" v-for="file of filesSystem" :key="file.name">
        <span
          @click="selectFile(file)"
          :class="{ active: activeFile === file.name }"
        >
          {{ file.name }}
        </span>
      </div>
      <div v-if="pending" class="file addFile">
        <input type="text" v-model="placeholder" @keyup.enter="addFileDone" />
      </div>
      <button class="addButton" @click="addFileStart">+</button>
      <div id="editor"></div>
    </div>
    <div id="preview" ref="preview"></div>
  </div>
</template>

<style lang="scss">
@import "./assets/variables.scss";
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
  background: $--bg-default;
}
#LAONE {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  #editor {
    height: 100%;
    width: 50vw;
  }
  #preview {
    height: 100%;
    width: 50%;
    & iframe {
      width: 100%;
      height: 100%;
      border: 1px solid rgb(55, 55, 55);
      background-color: #fff;
    }
  }
}
.file {
  display: inline-block;
}
.file span {
  display: inline-block;
  padding: 0.5em 2em 0.3rem;
  line-height: 20px;
  color: $--text-default;
  cursor: pointer;
}
.file .active {
  border-bottom: 2px solid $--text-highlight;
  color: $--text-highlight;
}
.addFile {
  color: $--text-default;
  > input {
    padding: 0.1rem;
    border: none;
    width: 4rem;
    outline: none;
    border-radius: 5%;
    width: 90px;
    height: 30px;
    line-height: 30px;
  }
}
.addButton {
  cursor: pointer;
  border: none;
  color: $--text-default;
  background: $--bg-default;
  margin-left: 6px;
}
</style>
