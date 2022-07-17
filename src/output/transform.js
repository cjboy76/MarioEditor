import hashId from "hash-sum";
import * as defaultCompiler from "vue/compiler-sfc";

const { shouldTransformRef, transformRef } = defaultCompiler;
const COMP_IDENTIFIER = `__sfc__`;

export const transformSFC = async (store, editorCode, fileName) => {
  if (!editorCode.trim()) return;

  if (fileName.endsWith(".js")) {
    let code = "";
    if (shouldTransformRef(editorCode)) {
      code = transformRef(editorCode, { fileName }).code;
    }
    store.files[fileName].compiled.js = code;
    return;
  }

  let clientCode = "";

  const { descriptor } = defaultCompiler.parse(editorCode, {
    filename: fileName,
    sourceMap: true,
  });

  const id = hashId(fileName);
  const hasScoped = descriptor.styles.some((s) => s.scoped);

  const compiledScriptResult = await doCompileScript(descriptor, id);

  if (!compiledScriptResult) return;

  const [clientScript, bindings] = compiledScriptResult;

  clientCode += clientScript;

  if (descriptor.template && !descriptor.scriptSetup) {
    const clientTemplateResult = await doCompileTemplate(
      store,
      descriptor,
      id,
      bindings,
      false
    );

    if (!clientTemplateResult) {
      return;
    }
    clientCode += clientTemplateResult;
  }

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
  if (clientCode) {
    clientCode +=
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(fileName)}` +
      `\nexport default ${COMP_IDENTIFIER}`;
  }

  store.updateCompiledFile(
    { js: clientCode.trimStart(), css: css.trim() },
    fileName
  );
};

async function doCompileTemplate(store, descriptor, id, bindingMetadata, ssr) {
  const templateResult = await defaultCompiler.compileTemplate({
    source: descriptor.template.content,
    filename: descriptor.filename,
    id,
    scoped: descriptor.styles.some((s) => s.scoped),
    slotted: descriptor.slotted,
    ssr,
    ssrCssVars: descriptor.cssVars,
    isProd: false,
    compilerOptions: {
      bindingMetadata,
    },
  });
  if (templateResult.errors.length) {
    return;
  }

  const fnName = ssr ? `ssrRender` : `render`;

  let code =
    `\n${templateResult.code.replace(
      /\nexport (function|const) (render|ssrRender)/,
      `$1 ${fnName}`
    )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`;

  return code;
}

async function doCompileScript(descriptor, id) {
  if (!descriptor.script && !descriptor.scriptSetup) {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined];
  }
  try {
    const compiledScript = await defaultCompiler.compileScript(descriptor, {
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

    return [outputCode, compiledScript.bindings];
  } catch (e) {
    return;
  }
}
