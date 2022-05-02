// Allow typescript to import image files as assets (vite will import them as data uris)

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.svg' {
    const value: any;
    export = value;
}