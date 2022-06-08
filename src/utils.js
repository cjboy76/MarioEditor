export function debounce(fn, n = 250) {
  let handle;
  return (...args) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      fn(...args);
    }, n);
  };
}

export function stringFormat(string) {
  return string.replace(/\r?\n|\r/g, "");
}

export function filesFormat(files, isJscode = false) {
  let output = "";
  for (const file in files) {
    if (isJscode) {
      output += `${files[file]};`.replace(/;;/, ";");
    } else {
      output += `${files[file]}`;
    }
  }
  return output;
}
