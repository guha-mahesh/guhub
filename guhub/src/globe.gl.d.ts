declare module 'globe.gl' {
  interface GlobeInstance {
    (el: HTMLElement): GlobeInstance;
    width(w: number): GlobeInstance;
    height(h: number): GlobeInstance;
    backgroundColor(color: string): GlobeInstance;
    showAtmosphere(show: boolean): GlobeInstance;
    atmosphereColor(color: string): GlobeInstance;
    atmosphereAltitude(alt: number): GlobeInstance;
    polygonsData(data: any[]): GlobeInstance;
    polygonCapColor(fn: (feat: any) => string): GlobeInstance;
    polygonSideColor(fn: (feat: any) => string): GlobeInstance;
    polygonStrokeColor(fn: (feat: any) => string): GlobeInstance;
    polygonAltitude(fn: (feat: any) => number): GlobeInstance;
    polygonLabel(fn: (feat: any) => string): GlobeInstance;
    onPolygonHover(fn: (feat: any) => void): GlobeInstance;
    pointsData(data: any[]): GlobeInstance;
    pointLat(fn: (d: any) => number): GlobeInstance;
    pointLng(fn: (d: any) => number): GlobeInstance;
    pointAltitude(fn: (d: any) => number): GlobeInstance;
    pointRadius(fn: (d: any) => number): GlobeInstance;
    pointColor(fn: (d: any) => string): GlobeInstance;
    pointLabel(fn: (d: any) => string): GlobeInstance;
    onPointClick(fn: (d: any) => void): GlobeInstance;
    labelsData(data: any[]): GlobeInstance;
    labelLat(fn: (d: any) => number): GlobeInstance;
    labelLng(fn: (d: any) => number): GlobeInstance;
    labelText(fn: (d: any) => string): GlobeInstance;
    labelSize(fn: (d: any) => number): GlobeInstance;
    labelColor(fn: (d: any) => string): GlobeInstance;
    labelDotRadius(fn: (d: any) => number): GlobeInstance;
    labelAltitude(fn: (d: any) => number): GlobeInstance;
    onGlobeReady(fn: () => void): GlobeInstance;
    controls(): { autoRotate: boolean; autoRotateSpeed: number };
    pointOfView(pov: { lat: number; lng: number; altitude: number }, ms?: number): GlobeInstance;
    scene(): any;
    renderer(): any;
  }

  function Globe(options?: { animateIn?: boolean; waitForGlobeReady?: boolean }): GlobeInstance;
  export default Globe;
}
