import * as functions from "firebase-functions";
const cors = require("cors")({ origin: true });
import * as rp from "request-promise";
import * as shortid from "shortid";
import { WebClient } from "@slack/client";
const accessToken =
  "xoxp-748777362451-753838114625-762107818471-95fe22b54efcf0b55a2a3b48b5de8b75";

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

    const postingId = shortid.generate();
    // 実際に登録する
    let debug = "ok";
    try {
      await rp({
        method: "POST",
        uri: " https://us-central1-inner-meetup.cloudfunctions.net/posting",
        body: {
          postingId: shortid.generate(), // 投稿のID（tsと同じでよき）
          description, // 投稿内容
          postingType, // give/take
          userId: user_id, // 投稿したひとのSlackID
          channel: channel_id // 投稿されたチャンネルID
        },
        json: true // Automatically stringifies the body to JSON
      });
    } catch (err) {
      // 失敗した旨を通知
      debug = JSON.stringify(err);
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
${debug}
興味のある方はreactionをお願いします～
${postingId}

    `;
    res.send({
      response_type: "in_channel",
      text: resText
    });
  });
});

export const reaction = functions.https.onRequest(async (req, res) => {
  const {
    event
    // token
  } = req.body;

  const {
    // type,
    channel,
    ts
  } = event.item;
  // if (type !== "message") return;

  const slackClient = new WebClient(accessToken);
  try {
    const postInfo: any = await slackClient.channels.history({
      inclusive: true,
      channel,
      count: 1,
      latest: ts
    });
    if (!postInfo || !postInfo.messages || postInfo.messages.length === 0) {
      throw { status: 404, code: "Post not found" };
    }
    const message = postInfo.messages[0];
    const _msgs = message.split("興味のある方はreactionをお願いします～\n");
    if (_msgs.length <= 1) throw { msg: "invalid message" };
    const postingId = _msgs[1];
    const reactionsNum = (message.reactions || []).reduce(
      (count: number, el: any) => {
        return count + el.count;
      },
      0
    );
    await rp({
      method: "POST",
      uri: " https://us-central1-inner-meetup.cloudfunctions.net/updatePosting",
      body: {
        postingId, // 投稿のID（tsと同じでよき）
        reactionsNum // reactionの数
      },
      json: true // Automatically stringifies the body to JSON
    });
    await rp({
      method: "POST",
      uri:
        "https://hooks.slack.com/services/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",
      body: {
        response_type: "in_channel", // "in_channel"
        text: JSON.stringify({ reactionsNum, postInfo })
      },
      json: true // Automatically stringifies the body to JSON
    });
  } catch (err) {
    await rp({
      method: "POST",
      uri:
        "https://hooks.slack.com/services/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",
      body: {
        response_type: "in_channel", // "in_channel"
        text: JSON.stringify(err)
      },
      json: true // Automatically stringifies the body to JSON
    });
  }

  res.send({});
});
