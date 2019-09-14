import * as functions from 'firebase-functions';

export const createMeetup = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 });
 