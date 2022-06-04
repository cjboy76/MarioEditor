export function debounce(fn, n = 250) {
  let handle;
  return (...args) => {
    if (handle) clearTimeout(handle);
    handle = setTimeout(() => {
      fn(...args);
    }, n);
  };
}
