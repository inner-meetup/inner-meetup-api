import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import { firebaseConfig } from "../config/firebase";
import "firebase/auth";
import "firebase/database";

firebase.initializeApp(firebaseConfig);
// Get a reference to the database service

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const posting = functions.https.onRequest(
  async (request: any, response: any) => {
    try {

    const {
      postingId,
      description,
      postingType,
      userId,
      channel,
      ts
    } = request.body;

    const db = firebase.database();
    await db
      .ref("postings/" + "posting")
      .set({
        postingId,
        description,
        postingType,
        userId,
        channel,
        ts,
        reactions: []
      })
      .then(res => {
        console.log("res", res);
      })
      .catch(err => {
        console.log("err", err);
      });
    response.send("Hello from Firebase!");
    
  } catch (err) {
      
    response.send(JSON.stringify(err));
  }
  }
);

export const updatePosting = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
