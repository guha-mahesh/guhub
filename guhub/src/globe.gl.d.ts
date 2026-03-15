declare module 'globe.gl' {
  interface GlobeOptions {
    animateIn?: boolean;
    waitForGlobeReady?: boolean;
  }

  type GlobeInstance = ReturnType<typeof Globe>;

  function Globe(options?: GlobeOptions): (el: HTMLElement) => GlobeInstance;
  export default Globe;
}
