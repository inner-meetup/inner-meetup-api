import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import { firebaseConfig } from "../config/firebase";
import "firebase/auth";
import "firebase/database";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const posting = functions.https.onRequest(
  async (request: any, response: any) => {
    const {
      postingId,
      description,
      postingType,
      userId,
      channel,
      ts
    } = request.body;

    await db
      .ref("postings/" + postingId)
      .set({
        description,
        postingType,
        userId,
        channel,
        ts,
        reactionsNum: 0
      })
      .then(res => {
        console.log("res", res);
      })
      .catch(err => {
        console.log("err", err);
      });
    response.send("Hello from Firebase!");
  }
);

export const updatePosting = functions.https.onRequest(
  async (request: any, response: any) => {
    const { postingId, reactionsNum } = request.body;
    await db
      .ref("postings/" + postingId)
      .once("value")
      .then(function(snapshot) {
        const searchedPosting = snapshot.val() || {};
        const updates: any = {};
        updates["/postings/" + postingId] = {
          channel: searchedPosting.channel,
          description: searchedPosting.description,
          postingType: searchedPosting.postingType,
          ts: searchedPosting.ts,
          reactionsNum
        };
        db.ref().update(updates);
      })
      .catch(function(err) {
        response.status(404);
        response.send("Posting not found");
      });
    response.send("Posting Updated");
  }
);
