<script setup>
import { editorInit, monacoEditor } from "./utils/monaco";
import { computed, onMounted, ref } from "vue";
import { useFileStore, defaultMainFile } from "./store/fileStore";
import srcdoc from "./output/playground.html?raw";
import { debounce } from "./utils/debounce";
import { transformSFC } from "./output/transform";
import { compileModulesForPreview } from "./output/moduleComplier";

const preview = ref();
const fileStore = useFileStore();
const sandBox = document.createElement("iframe");
const filesSystem = ref(new Set());
const fileList = computed(() => {
  return [...filesSystem.value];
});

onMounted(() => {
  editorInit();
  sandBox.srcdoc = srcdoc;
  preview.value.appendChild(sandBox);
  filesSystem.value.add(defaultMainFile);

  sandBox.addEventListener("load", () => {
    updateView();
  });

  monacoEditor.getModel().onDidChangeContent(
    debounce(() => {
      updateView();
    }, 500)
  );
});

const updateView = () => {
  fileStore.updateFile(monacoEditor.getValue(), activeFile.value);
  compileResult();
};

const compileResult = async () => {
  for (const file in fileStore.files) {
    await transformSFC(fileStore, fileStore.files[file].code, file);
  }

  const modules = compileModulesForPreview(fileStore);

  const codeToEval = [
    `window.__modules__ = {};window.__css__ = '';` +
      `if (window.__app__) window.__app__.unmount();` +
      `document.body.innerHTML = '<div id="app"></div>'`,
    ...modules,
    `document.getElementById('playground_styles').innerHTML = window.__css__`,
  ];

  codeToEval.push(`
        import { createApp as _createApp } from "vue"
        const _mount = () => {
          const AppComponent = __modules__["${defaultMainFile}"].default
          AppComponent.name = 'Repl'
          const app = window.__app__ = _createApp(AppComponent)
          app.config.unwrapInjectedRef = true
          app.config.errorHandler = e => console.error(e)
          app.mount('#app')
        }
        _mount()
        `);

  sandBox.contentWindow.postMessage(
    {
      action: "eval",
      code: codeToEval,
    },
    "*"
  );
};

const setEditorContent = (fileName) => {
  Monaco.editor.setModelLanguage(
    monacoEditor.getModel(),
    fileName.endsWith("js")
      ? "javascript"
      : fileName.endsWith("vue")
      ? "html"
      : "css"
  );
  const file = fileStore.$state.files[fileName];
  const content = file ? file.code : "";
  monacoEditor.getModel().setValue(content);
};

const activeFile = ref("App.vue");

const selectFile = (filename) => {
  activeFile.value = filename;
  setEditorContent(activeFile.value);
};
const pending = ref(false);
const addFileStart = () => {
  pending.value = true;
};

const checkDuplicate = (files, fileName) => {
  return files.has(fileName);
};

const addFileDone = () => {
  if (!pending.value) return;
  const fileName = placeholder.value;
  if (!/\.(js|css|vue)$/.test(fileName)) {
    alert("File type not allowed.");
    return;
  }
  const isDuplicate = checkDuplicate(filesSystem.value, fileName);
  if (isDuplicate) {
    alert("File name existed.");
    return;
  }

  addFileCancel();
  filesSystem.value.add(fileName);
  selectFile(fileName);
};
const addFileCancel = () => {
  placeholder.value = "Sample.vue";
  pending.value = false;
};
const placeholder = ref("Sample.vue");
const focus = ({ el }) => {
  el.focus();
};

const removeFile = (fileName) => {
  alert(`Really want to delete ${fileName} ???`);
  fileStore.removeFile(fileName);
  filesSystem.value = filesSystem.value.delete(fileName);
  activeFile.value = defaultMainFile;
  selectFile({ name: activeFile.value });
};
</script>

<template>
  <div id="Mario">
    <div class="editor">
      <div
        class="file"
        v-for="file of fileList"
        :key="file"
        :class="{ active: activeFile === file }"
      >
        <span @click="selectFile(file)">
          {{ file }}
        </span>
        <span
          class="p-0"
          v-if="file.name !== 'App.vue'"
          @click="removeFile(file)"
          >✖️</span
        >
      </div>
      <div v-if="pending" class="file addFile">
        <input
          type="text"
          spellcheck="false"
          v-model="placeholder"
          @keyup.enter="addFileDone"
          @keyup.esc="addFileCancel"
          @blur="addFileDone"
          @vnodeMounted="focus"
        />
      </div>
      <button class="addButton" @click="addFileStart">➕</button>
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
#Mario {
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
  span {
    display: inline-block;
    padding: 0.5em 2em 0.3rem;
    line-height: 20px;
    color: $--text-default;
    cursor: pointer;
  }
  .p-0 {
    padding: 0;
  }
}
.active {
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
