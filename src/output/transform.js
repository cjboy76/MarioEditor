import hashId from "hash-sum";
import * as defaultCompiler from "vue/compiler-sfc";
const { shouldTransformRef, transformRef } = defaultCompiler;

const COMP_IDENTIFIER = `__sfc__`;

export const transformSFC = (editorValue, fileName) => {
  const id = hashId(fileName);
  let clientCode = "";

  const { descriptor } = defaultCompiler.parse(editorValue, {
    filename: fileName,
    sourceMap: true,
  });

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

  // style
  // let css = "";
  // for (const style of descriptor.styles) {
  //   const styleResult = defaultCompiler.compileStyle({
  //     source: style.content,
  //     filename: fileName,
  //     id,
  //     scoped: style.scoped,
  //     modules: !!style.module,
  //   });
  //   css += styleResult.code + "\n";
  // }
  // console.log("compiled css >>>", css);
  if (clientCode) {
    clientCode +=
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(fileName)}` +
      `\nexport default ${COMP_IDENTIFIER}`;
  }
  return clientCode;
};
