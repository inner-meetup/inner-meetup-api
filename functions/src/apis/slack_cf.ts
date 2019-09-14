import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const slashcommand = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

export const slashcommand2 = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });