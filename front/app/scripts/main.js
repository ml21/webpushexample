'use strict';

const applicationServerPublicKey = 'BLHhXmMT2rwr0feGmc4Tg2jPADLcYnYSyWSBtv4XgGbZoDr2ByAasQBU3YJwLAGHlKqvFIx7Ulj0pdWTe6kLoaA';

const pushButton = document.querySelector('.js-push-btn');
const subscriptionJsonElement = document.querySelector('.js-subscription-json');
const subscriptionDetailsElement = document.querySelector('.js-subscription-details');

function undefinedReplacer(k, v) {
  if (v === undefined) return null;

  return v;
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// генерация ключей https://web-push-codelab.glitch.me/

// Public Key
// BLHhXmMT2rwr0feGmc4Tg2jPADLcYnYSyWSBtv4XgGbZoDr2ByAasQBU3YJwLAGHlKqvFIx7Ulj0pdWTe6kLoaA

// Private Key
// 7j2JclnAuKdmOJn6G_a34KW8D9MLeSyxzItUPN9Vqm

function PushGuiComponent() {

    this.pushButton = document.querySelector('.js-push-btn');
    this.subscriptionJsonElement = document.querySelector('.js-subscription-json');
    this.subscriptionDetailsElement = document.querySelector('.js-subscription-details');

    let self = this;

    function initializeForBlocked()
    {
        console.warn('push messaging blocked');
        self.pushButton.textContent = 'Push messaging blocked';
        self.pushButton.disabled = true;

        return Promise.resolve();
    }

    function initializeForSubscribed(
      descriptionText,
      subscribeAction,
      unsubscribeAction) {
      console.log('user is subscribed');

      self.subscriptionJsonElement.textContent = descriptionText;
      self.subscriptionDetailsElement.classList.remove('is-invisible');


      self.pushButton.textContent = 'disable push messaging';
      self.pushButton.disabled = false;

      self.pushButton.addEventListener(
        'click',
        () => {
          self.pushButton.disabled = true;

          return unsubscribeAction()
            // если ошибка будет при выполнении action, то она всплывет верх по стеку
            .then(() => self
              .initializeForUnsubscribed(
                subscribeAction,
                unsubscribeAction)
              .catch(someUiError => console.log("ошибка в интерфейсе, но пользователя мы уже отписали")));
        },
        { once: true });

      return Promise.resolve();
    }

    function initializeForUnsubscribed(
      subscribeAction,
      unsubscribeAction) {
      console.log('user is unsubscribed');

      self.subscriptionDetailsElement.classList.add('is-invisible');

      self.pushButton.textContent = 'enable push messaging';
      self.pushButton.disabled = false;

      self.pushButton.addEventListener(
        'click',
        () => {
          self.pushButton.disabled = true;

          return subscribeAction()
            // если ошибка будет при выполнении action, то она всплывет верх по стеку
            .then(descriptionText => self
              .initializeForSubscribed(
                descriptionText,
                subscribeAction,
                unsubscribeAction)
              .catch(someUiError => console.log("ошибка в интерфейсе, но пользователя мы уже подписали")));
        },
        { once: true });

      return Promise.resolve();
    }

    self.initializeForBlocked = initializeForBlocked;
    self.initializeForSubscribed = initializeForSubscribed;
    self.initializeForUnsubscribed = initializeForUnsubscribed;
}

function isWebPushSupported() {
    let isServiceWorkerSupported = 'serviceWorker' in navigator;
    let isPushSupported = 'PushManager' in window;

    if (!isServiceWorkerSupported) return Promise.reject('service worker not supported');

    if (!isPushSupported) return Promise.reject('push is not supported');

    return Promise.resolve();
}

function registerServiceWorker(source)
{
  return navigator.serviceWorker
    .register(source)
    .then(function(registration) {
      return {
        serviceWorkerRegistration: registration,
        message:`service worker for ${source} is registered`
      };
    });
}

function subscribeUser(pushManager) {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  // return Promise.reject("subscribe user error");
  return pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey })
    .then(subscribeOnBackend)
    .then(subscription => JSON.stringify(subscription));

}

function unsubscribeUser(pushManager) {
  return pushManager
    .getSubscription()
    .then(subscription => subscription
      .unsubscribe()
      .then(isUnsubscribe => {
        if (isUnsubscribe == true) return unsubscribeOnBackend(subscription);

        return Promise.reject("fail to unsubscribe user");
      }));
}

function subscribeFake() {
  console.log('some subscribe action');
  return Promise.resolve("description from subscribeFake");
}

function unsubscribeFake() {
  console.log('some unsubscribe action');
  return Promise.resolve();
}

function subscribeOnBackend(subscription) {
  console.log(`Subscribed subscription for update on backend ${JSON.stringify(subscription)}`);
  console.log('Here subscription must be sent to backend server...');

  return Promise.resolve(subscription);
}

function unsubscribeOnBackend(subscription) {
  console.log(`Unsusbscribed subscription for update on backend ${JSON.stringify(subscription)}`);
  console.log('Here subscription must be sent to backend server...');

  return Promise.resolve();
}

let gui = new PushGuiComponent();

isWebPushSupported()
    .then(() => navigator.serviceWorker.register('serviceWorker.js'))
    // .then(() => Promise.reject("service worker registration error"))
    .then(serviceWorkerRegistration => serviceWorkerRegistration.pushManager
      .getSubscription()
      .then((subscription) => {
        let isPermissionDenied = Notification.permission === 'denied';

        if (isPermissionDenied) return gui.initializeForBlocked();

        let isSubscribed = subscription !== null;

        if (isSubscribed == true) {
          return gui
            .initializeForSubscribed(
              JSON.stringify(subscription),
              () => subscribeUser(serviceWorkerRegistration.pushManager),
              () => unsubscribeUser(serviceWorkerRegistration.pushManager));
        } else {
          return gui
            .initializeForUnsubscribed(
              () => subscribeUser(serviceWorkerRegistration.pushManager),
              () => unsubscribeUser(serviceWorkerRegistration.pushManager));
        }
    }))
    .catch(console.warn.bind(console));
