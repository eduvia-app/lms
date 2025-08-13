export {}

declare global {
  // May return string or an object with `.format(...)` when placeholders exist
  function __(text: string): any
}

declare module 'vue' {
  interface ComponentCustomProperties {
    __: (text: string) => any
  }
}