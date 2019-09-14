import * as functions from "firebase-functions";
const cors = require("cors")({ origin: true });
import * as rp from "request-promise";

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const addMeetup = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { user_name, user_id, channel_id } = req.body;
    const userSlackName = `<@${user_id}|${user_name}>`;
    const reqText = req.body.text;
    if (!reqText || reqText.split(" ").lenghth < 2) {
      res.send({
        response_type: "ephemeral",
        text: "`/meetup [want or give] [title]` の形式で送ってほしいポン。。"
      });
      return;
    }
    const postingType = reqText.split(" ")[0];
    const description = reqText.split(" ")[1];
    // postingType によるエラーハンドリング
    if (postingType !== "take" && postingType !== "give") {
      res.send({
        response_type: "ephemeral",
        text: "第一引数は `take` か `give` にしてほしいポン。。"
      });
      return;
    }

    // 実際に登録する
    try {
      await rp({
        method: "POST",
        uri: " https://us-central1-inner-meetup.cloudfunctions.net/posting",
        body: {
          postingId: "aaaa", // 投稿のID（tsと同じでよき）
          description, // 投稿内容
          postingType, // give/take
          userId: user_id, // 投稿したひとのSlackID
          channel_id: channel_id // 投稿されたチャンネルID
        },
        json: true // Automatically stringifies the body to JSON
      });
    } catch (err) {
      // 失敗した旨を通知
      res.send({
        response_type: "ephemeral",
        text: `*エラーが発生したようです*\n${JSON.stringify(err)}`
      });
      return;
    }

    const resText = `
*勉強会が申し込まれました！*
\`立案者:\` ${userSlackName}
\`種別:\` ${postingType}
\`内容:\` ${description}

興味のある方はreactionをお願いします～
${JSON.stringify(req.body)}
    `;
    res.send({
      response_type: "in_channel",
      text: resText
    });
  });
});

export const reaction = functions.https.onRequest(async (req, res) => {
  
  await rp({
    method: "POST",
    uri:
      "https://hooks.slack.com/services/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",
    body: {
      response_type: "in_channel", // "in_channel"
      text: JSON.stringify(req.body),
      // attachments: [
      //   {
      //     text: '',
      //     callback_id: "invite",
      //     actions: [
      //       {
      //         name: userName,
      //         text: "仕事を依頼する",
      //         type: "button",
      //         style: "danger",
      //         value: userId
      //       }
      //     ]
      //   }
      // ],
    },
    json: true // Automatically stringifies the body to JSON
  });
  
  res.send("Hello from Firebase!");
});
