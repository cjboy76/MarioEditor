import * as Monaco from "monaco-editor-core";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import vueWorker from "monaco-volar/vue.worker?worker";
import * as onigasm from "onigasm";
import onigasmWasm from "onigasm/lib/onigasm.wasm?url";
import {
  prepareVirtualFiles,
  loadTheme,
  // loadGrammars
} from "monaco-volar";
import { VueWelcomeCode } from "../store/fileStore";
import { loadGrammars } from "../grammars";

function loadOnigasm() {
  return onigasm.loadWASM(onigasmWasm);
}

function setupMonacoEnv() {
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
      if (label === "vue") {
        return new vueWorker();
      }
      return new editorWorker();
    },
  };
}

let monacoEditor;

const editorInit = async () => {
  setupMonacoEnv();
  await loadOnigasm();
  const theme = await loadTheme();
  monacoEditor = Monaco.editor.create(document.getElementById("editor"), {
    value: VueWelcomeCode,
    language: "vue",
    fontSize: "16px",
    theme,
  });
  await loadGrammars(monacoEditor);
  await prepareVirtualFiles();
  console.log(Monaco.languages.getLanguages());
};

export { monacoEditor, editorInit, Monaco };
