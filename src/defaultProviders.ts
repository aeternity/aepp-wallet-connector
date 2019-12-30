import 'aepp-base/src/lib/initEnv';
// @ts-ignore
import { Universal, Aepp } from '@aeternity/aepp-sdk/es';
// @ts-ignore
import DeeplinkClient from './DeeplinkClient';
import baseAeppIconPath from './assets/base-aepp.png';
import waelletIconPath from './assets/waellet.png';

const IS_MOBILE_DEVICE = window.navigator.userAgent.includes('Mobi');

export const baseAeppDeeplink: Provider = {
  name: 'Base Aepp Deeplink',
  isAvailable: isDeveloperMode => isDeveloperMode || IS_MOBILE_DEVICE,
  icon: baseAeppIconPath,
  initSdk: async (stamps, params) => DeeplinkClient.compose(...stamps || [Universal])(params),
};

export const baseAeppIframe: Provider = {
  name: 'Base Aepp Iframe',
  isAvailable: isDeveloperMode => isDeveloperMode || IS_MOBILE_DEVICE,
  icon: baseAeppIconPath,
  initSdk: async (stamps, params) => Aepp.compose(...stamps)({ ...params, parent: window.parent }),
};

export const baseAeppReverseIframe: Provider = {
  name: 'Base Aepp Reverse Iframe',
  isAvailable: isDeveloperMode => isDeveloperMode || !IS_MOBILE_DEVICE,
  icon: baseAeppIconPath,
  initSdk: async (stamps, params) => {
    const iframe = document.createElement('iframe');
    iframe.src = prompt('Enter wallet URL', '') || 'https://stage-identity.aepps.com';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    await new Promise((resolve) => {
      const handler = ({ data } : { data: any }) => {
        if (data.method !== 'ready') return;
        window.removeEventListener('message', handler);
        resolve();
      };
      window.addEventListener('message', handler);
    });

    await Aepp.compose(...stamps)({ ...params, parent: iframe.contentWindow });
  },
};

export const waelletIframe: Provider = {
  name: 'Waellet Iframe',
  isAvailable: isDeveloperMode => isDeveloperMode && !IS_MOBILE_DEVICE,
  icon: waelletIconPath,
  initSdk: async (stamps, params) => Aepp.compose(...stamps)({ ...params, parent: window.parent }),
};

export default [
  baseAeppDeeplink,
  baseAeppIframe,
  baseAeppReverseIframe,
  waelletIframe,
];
