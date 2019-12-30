/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* global localStorage */

import stampit from '@stamp/it';
import AsyncInit from '@aeternity/aepp-sdk/es/utils/async-init';
import * as R from 'ramda';

let cachedAddress;

const genProxyMethod = method => (...params) => {
  if (method === 'address' && cachedAddress) return Promise.resolve(cachedAddress);
  return this.request(method, params);
};

const localStorageKey = 'DeeplinkClientResponse';

export const storeResponse = () => {
  const url = new URL(window.location.href);
  const result = url.searchParams.get('result');
  const error = url.searchParams.get('error');

  if (result || error) {
    localStorage.setItem(
      localStorageKey,
      JSON.stringify(
        error ? { error: decodeURIComponent(error) }
          : { result: JSON.parse(decodeURIComponent(result)) },
      ),
    );
    window.close();
  }
};

export default stampit(AsyncInit, {
  async init() {
    const storageHandler = () => {
      const response = localStorage[localStorageKey];
      if (response) {
        handleResponse(JSON.parse(response));
        localStorage.removeItem(localStorageKey);
      }
    };

    localStorage.clear();
    window.addEventListener('storage', storageHandler);

    const requestQueue = [];
    let waitingForResponse = false;

    const handleResponse = ({ result, error }) => {
      const request = requestQueue.shift();
      if (result && request.name === 'address') cachedAddress = result;
      if (result) request.resolve(result);
      else request.reject(error);
      waitingForResponse = false;
      callMethodFromQueue();
    };

    const buildRequestUrl = (method, params) => {
      const url = new URL(`https://base.aepps.com/${method}`);
      params.forEach((p, i) => url.searchParams.set(`param${i}`, JSON.stringify(p)));
      url.searchParams.set('callback', window.location.origin + window.location.pathname);
      return url;
    };

    const callMethodFromQueue = () => {
      if (!waitingForResponse && requestQueue.length) {
        const { name, params } = requestQueue[0];
        waitingForResponse = true;
        window.open(buildRequestUrl(name, params));
      }
    };

    this.request = (name, params) => {
      const p = new Promise((resolve, reject) => {
        requestQueue.push({
          name, params, resolve, reject,
        });
      });
      callMethodFromQueue();
      return p;
    };

    this.destroyClient = () => window.removeEventListener('storage', storageHandler, false);

    const { address, network } = await this.request('addressAndNetworkUrl', []);
    cachedAddress = address;
    this.url = network.url;
    this.internalUrl = network.internalUrl;
    this.compilerUrl = network.compilerUrl;
  },
  composers({ stamp }) {
    if (stamp.compose.methods) {
      ['address', 'sign', 'signTransaction'].forEach(m => delete stamp.compose.methods[m]);
    }
    const deeplinkMethods = R.fromPairs(['address', 'sign', 'signTransaction'].map(m => [m, genProxyMethod(m)]));
    stamp.compose.methods = Object.assign(deeplinkMethods, stamp.compose.methods);
  },
});
