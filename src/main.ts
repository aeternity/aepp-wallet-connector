import Vue from 'vue';
import Overlay from './Overlay.vue';
import defaultProviders, * as providers from './defaultProviders';

export { providers };

const chooseProviderOverlay = async (
  providersList: Provider[],
  developerMode: boolean,
): Promise<Provider> => {
  const mountPoint = document.createElement('div');
  mountPoint.id = 'overlay';
  document.body.appendChild(mountPoint);

  const linkNodes = [
    'https://fonts.googleapis.com/css?family=IBM+Plex+Mono:300,400,500,600,700&display=swap',
    'https://rsms.me/inter/inter.css',
  ].map((url) => {
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return link;
  });

  return new Promise((resolve) => {
    const vm = new Vue({
      render: h => h(Overlay, {
        props: { providers: providersList, developerMode },
        on: {
          select(p: Provider): void {
            vm.$destroy();
            document.getElementById('overlay')!.remove();
            linkNodes.forEach(l => l.remove());
            resolve(p);
          },
        },
      }),
    }).$mount('#overlay');
  });
};

export default async (
  providersList: Provider[] = defaultProviders,
  stamps: object[] = [],
  params: object = {},
  developerMode: boolean = false,
): Promise<any> => (providersList.length > 1
  ? await chooseProviderOverlay(providersList, developerMode)
  : providersList[0]).initSdk(stamps, params);

Vue.config.productionTip = false;
