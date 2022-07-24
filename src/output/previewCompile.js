import { transformSFC } from "./transform";
import { compileModulesForPreview } from "./moduleComplier";
import { defaultMainFile } from "../store/fileStore";

const compileResult = async (fileStore, previewFrame) => {
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

  previewFrame.contentWindow.postMessage(
    {
      action: "eval",
      code: codeToEval,
    },
    "*"
  );
};

export { compileResult };
