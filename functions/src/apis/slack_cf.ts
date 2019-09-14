import * as functions from "firebase-functions";
const cors = require("cors")({ origin: true });
// import * as rp from "request-promise";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const addMeetup = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const userName = req.body.user_name;
    const userId = req.body.user_id;
    const userSlackName = `<@${userId}|${userName}>`;
    const reqText = req.body.text;
    if (!reqText || reqText.split(" ").lenghth < 2) {
      res.send({
        response_type: "ephemeral", // "in_channel"
        text: "`/meetup [type] [title]` の形式で送ってほしいポン。。"
      });
      return;
    }
    const type = reqText.split(" ")[0];
    const title = reqText.split(" ")[1];

    // TODO: type によるエラーハンドリング

    let resText = `
*勉強会が申し込まれました！*
\`立案者:\` ${userSlackName}
\`種別:\` ${type}
\`タイトル:\` ${title}

興味のある方はreactionをお願いします～
    `;
    res.send({
      response_type: "in_channel", // "in_channel"
      text: resText
    });
  });
});

export const addMeetup2 = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
