import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import { firebaseConfig } from "../config/firebase";

firebase.initializeApp(firebaseConfig);
// Get a reference to the database service

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const posting = functions.https.onRequest((request, response) => {
  const db = firebase.database();
  console.log("request", request);
  db.ref("users/" + "a").set({
    username: "userId"
  });
  response.send("Hello from Firebase!");
});

export const updatePosting = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
