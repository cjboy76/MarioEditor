import hashId from "hash-sum";
import * as defaultCompiler from "vue/compiler-sfc";

const { shouldTransformRef, transformRef } = defaultCompiler;
const COMP_IDENTIFIER = `__sfc__`;

export const transformSFC = (store, editorValue, fileName) => {
  const id = hashId(fileName);

  if (fileName.endsWith(".js")) {
    let code = "";
    if (shouldTransformRef(editorValue)) {
      code = transformRef(editorValue, { fileName }).code;
    }
    store.files[fileName].compiled.js = code;
    return;
  }

  let clientCode = "";

  const { descriptor } = defaultCompiler.parse(editorValue, {
    filename: fileName,
    sourceMap: true,
  });

  const hasScoped = descriptor.styles.some((s) => s.scoped);

  // script
  const compiledScript = defaultCompiler.compileScript(descriptor, {
    inlineTemplate: true,
    id,
    templateOptions: {
      ssr: false,
    },
  });

  let outputCode = "";
  outputCode +=
    `\n` +
    defaultCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER);
  clientCode += outputCode;

  // template
  // const { code } = defaultCompiler.compileTemplate({
  //   id,
  //   filename: fileName,
  //   source: descriptor.template.content,
  //   scoped: descriptor.styles.some((s) => s.scoped),
  //   slotted: descriptor.slotted,
  // });
  // clientCode += code;

  if (hasScoped) {
    clientCode += `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(
      `data-v-${id}`
    )}`;
  }

  // style
  let css = "";
  for (const style of descriptor.styles) {
    const styleResult = defaultCompiler.compileStyle({
      source: style.content,
      filename: fileName,
      id,
      scoped: style.scoped,
      modules: !!style.module,
    });
    css += styleResult.code + "\n";
  }
  css = css.trim();
  if (clientCode) {
    clientCode +=
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(fileName)}` +
      `\nexport default ${COMP_IDENTIFIER}`;
  }

  store.updateCompiledFile({ js: clientCode, css }, fileName);
};
