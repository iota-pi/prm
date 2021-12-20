/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';
import firebaseConfig from './utils/firebase-config';

declare const self: ServiceWorkerGlobalScope;

function initServiceWorker() {
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  onBackgroundMessage(messaging, async payload => {
    console.log('[service worker] Received background message', payload);
    // Customize notification here
    const notificationTitle = 'Prayer reminder';
    const notificationOptions = {
      body: 'Pray for the flock!',
      icon: '/flock.png',
    };

    self.registration.showNotification(
      notificationTitle,
      notificationOptions,
    );
  });
}

initServiceWorker();

// @ts-ignore
const ignored = self.__WB_MANIFEST;
