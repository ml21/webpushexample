'use strict';

console.log('from serviceWorker.js');

self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification click received');

    event.notification.close();

    event.waitUntil(
        self.clients.openWindow('https://retailrocket.ru/')
    );
});

self.addEventListener('push', event => {
    console.warn('[Service Worker] Push received');
    console.log(`[Service Worker] Push data: ${event.data.text()}`);

    const title = 'RR push codelab';
    const options = {
        body: `Text data from event: ${event.data.text()}`,
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});