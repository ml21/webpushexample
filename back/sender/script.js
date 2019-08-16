/* пример запуска
node script 'BPBYBtH7OiNoUDCtW-qTHZ-jSfkCJk8LfBSHN-84Za-XxKUM6h-ruqNZ9JfoTWNuasAehVKiWUVpf4nVhIvvk6Y' 'maF4iqoaQe-QZ9-8AoRQTFruhdbCOqdhErcg55ffSYk' '{"endpoint":"https://fcm.googleapis.com/fcm/send/e4tldJ6M-qA:APA91bGZ-L5tGiKm86HUBbYJ3zXcpfGfQeV75a0hbbmZ9UTjpoBuFEXXc2vNK7rHhVIp-skUJyI5QSFIkcutCzWyF6UQJoqsviLvnQpBBuJlHxi0pvkPKRQ7_upEYvmoXvqnl3GSQvvS","expirationTime":null,"keys":{"p256dh":"BNqc8735g3R0C293A7srjY8qpvlwIn6rJVMS_5Esg5UXEwD9NwTeunIu-WKfbtoR8wy8eCU2He0dzdw3io5W-R0","auth":"G3bh2ffahY3ME1kIsh_xkg"}}'
*/

console.log("Args\n1: public key from https://web-push-codelab.glitch.me/\n2: private key from https://web-push-codelab.glitch.me/\n3: subscription object");

const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.argv[2],
  privateKey: process.argv[3]
};
const subscription = JSON.parse(process.argv[4]);

console.log(`\nTry to triger push for subscription ${JSON.stringify(subscription)}\n\nvapidKeys ${JSON.stringify(vapidKeys)}`);



const triggerPushMessage = function(subscription, dataToSend) {
    return webpush.sendNotification(subscription, dataToSend)
        .then(() => console.log('push message has been triggered successful'))
        .catch(err => {
            if (err.statusCode === 404 || err.statusCode === 410) {
                console.log('Subscription has expired or is no longer valid: ', err);
                return;
            }
            console.log(err);
        });
};

webpush.setVapidDetails(
    'mailto:pushscript@rr.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);


triggerPushMessage(subscription, "from script");