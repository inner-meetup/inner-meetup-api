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
    
    // await rp({
    //     method: "POST",
    //     uri:
    //       " https://us-central1-inner-meetup.cloudfunctions.net/posting",
    //     body: {
    //       postingId: 'aaaa',  // 投稿のID（tsと同じでよき）
    //       description,  // 投稿内容
    //       postingType,  // give/take
    //       userId, // 投稿したひとのSlackID
    //       channel: string, // 投稿されたチャンネルID 
    //       ts: Date, // 投稿時間
    //     },
    //     json: true // Automatically stringifies the body to JSON
    //   })
    // });

    const resText = `
*勉強会が申し込まれました！*
\`立案者:\` ${userSlackName}
\`種別:\` ${postingType}
\`内容:\` ${description}

興味のある方はreactionをお願いします～
${req.body}
    `;
    res.send({
      response_type: "in_channel",
      text: resText
    });
  });
});

export const addMeetup2 = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});
