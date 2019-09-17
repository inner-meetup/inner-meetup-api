import * as functions from "firebase-functions";
const cors = require("cors")({ origin: true });
import * as firebase from "firebase/app";
import { firebaseConfig } from "../config/firebase";
import * as rp from "request-promise";
import "firebase/auth";
import "firebase/database";

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

export const posting = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { postingId, description, postingType, userId, channel } = req.body;

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
    res.send("Hello from Firebase!");
  });
});

export const updatePosting = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { postingId, reactionsNum } = req.body;
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
          userId: searchedPosting.userId,
          reactionsNum
        };
        db.ref().update(updates);
      })
      .catch(function(err) {
        res.status(404);
        res.send("Posting not found");
      });
    res.send("Posting Updated");
  });
});

export const postRankingToSlack = functions.https.onRequest(
  async (req, res) => {
    cors(req, res, async () => {
      await db
        .ref("postings")
        .once("value")
        .then(async function(snapshot) {
          const postings = snapshot.val() || {};
          const postingObjs = await Promise.all(
            Object.keys(postings).map(async (_posting: string) => {
              const postingObj = await db
                .ref("postings/" + _posting)
                .once("value");
              return postingObj;
            })
          );
          const sortedpostingObjs: any = JSON.parse(
            JSON.stringify(postingObjs)
          ).sort((prevPosting: any, nextPosting: any) => {
            return nextPosting.reactionsNum - prevPosting.reactionsNum;
          });
          function message(type: string) {
            switch (type) {
              case "take":
                return "が教えられたいそうです";
              case "give":
                return "が教えたいそうです";
              default:
                return "が教えられたいそうです";
            }
          }
          const text = `1位: \`${sortedpostingObjs[0].description}\`…${
            sortedpostingObjs[0].reactionsNum
          }票（<@${sortedpostingObjs[0].userId}>${message(
            sortedpostingObjs[0].postingType
          )}）\n2位: \`${sortedpostingObjs[1].description}\`…${
            sortedpostingObjs[1].reactionsNum
          }票（<@${sortedpostingObjs[1].userId}>${message(
            sortedpostingObjs[1].postingType
          )}）\n3位: \`${sortedpostingObjs[2].description}\`…${
            sortedpostingObjs[2].reactionsNum
          }票（<@${sortedpostingObjs[2].userId}>${message(
            sortedpostingObjs[2].postingType
          )}）`;
          const payload = {
            channel: "inner-meetup",
            username: "いま人気のある勉強会はこちら！",
            text,
            icon_emoji: ":man_dancing:"
          };
          await rp({
            uri:
              "https://hooks.slack.com/services/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",
            method: "POST",
            form: `payload=${JSON.stringify(payload)}`,
            json: true
          });
        });
      res.send("Posting To Slack Successed");
    });
  }
);
