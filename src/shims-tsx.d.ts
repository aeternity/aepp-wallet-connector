import Vue, { VNode } from 'vue';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any
    }
  }

  interface Provider {
    name: string,
    isAvailable: (isDeveloperMode: boolean) => boolean,
    icon: string,
    initSdk: (stamps?: any, params?: object) => object,
  }
}
