import * as functions from "firebase-functions";
import * as firebase from "firebase/app";
import { firebaseConfig } from "../config/firebase";
import * as rp from "request-promise";
import "firebase/auth";
import "firebase/database";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export const posting = functions.https.onRequest(
  async (request: any, response: any) => {
    try {

    const {
      postingId,
      description,
      postingType,
      userId,
      channel
    } = request.body;

    await db
      .ref("postings/" + postingId)
      .set({
        description,
        postingType,
        userId,
        channel,
        reactionsNum: 0
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

export const postRankingToSlack = functions.https.onRequest(
  async (request: any, response: any) => {
    await db
      .ref("postings")
      .once("value")
      .then(async function(snapshot) {
        const postings = snapshot.val() || {};
        console.log("searchedPosting", Object.keys(postings));
        const postingObjs = await Promise.all(
          Object.keys(postings).map(async (_posting: string) => {
            const postingObj = await db
              .ref("postings/" + _posting)
              .once("value");
            return postingObj;
          })
        );
        const sortedpostingObjs = postingObjs.sort(
          (prevPosting: any, nextPosting: any) => {
            return prevPosting.reactionsNum - nextPosting.reactionsNum;
          }
        );
        console.log("postingObjs", postingObjs);
        const text = `JSON.stringify(payload)`;
        const payload = {
          channel: "inner-meetup",
          username: "人気のある勉強会はこちら！",
          text,
          icon_emoji: ":man-bowing::skin-tone-6:"
        };
        await rp({
          uri:
            "https://hooks.slack.com/services/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",
          method: "POST",
          form: `payload=${JSON.stringify(payload)}`,
          json: true
        });
      });
    response.send("Posting To Slack Successed");
  }
);
