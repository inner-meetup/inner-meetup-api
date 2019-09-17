import * as functions from "firebase-functions";
const cors = require("cors")({ origin: true });
import * as rp from "request-promise";
import * as shortid from "shortid";
import { WebClient } from "@slack/client";
import { accessToken } from "../config/slack";

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
    try {
      await rp({
        method: "POST",
        uri: " https://us-central1-inner-meetup.cloudfunctions.net/posting",
        body: {
          postingId, // 投稿のID（tsと同じでよき）
          description, // 投稿内容
          postingType, // give/take
          userId: user_id, // 投稿したひとのSlackID
          channel: channel_id // 投稿されたチャンネルID
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
\`種別:\` ${postingType === "give" ? "やりたい" : "やってほしい"}
\`内容:\` ${description}

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
  
  await rp({
    method: "POST",
    uri:
      "https://hooks.slack.com/services/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",
    body: {
      response_type: "in_channel", // "in_channel"
      text: JSON.stringify(new Date())
    },
    json: true // Automatically stringifies the body to JSON
  });
  const {
    event
    // token
  } = req.body;

  const {
    type,
    channel,
    ts
  } = event.item;
  if (type !== "message") return;

  const slackClient = new WebClient(accessToken);
  
  let tmp = '0';
  try {
    const postInfo: any = await slackClient.channels.history({
      inclusive: true,
      channel,
      count: 1,
      latest: ts
    });
    // tmp = JSON.stringify(postInfo)
    // tmp = postInfo.messages.length;
    if (!postInfo || !postInfo.messages || postInfo.messages.length === 0) {
      throw { status: 404, code: "Post not found" };
    }
    const message = postInfo.messages[0];
    tmp = 'aaa'
    tmp = JSON.stringify(message.text)
    const _msgs = message.text.split("\n");
    if (_msgs.length <= 1) throw { msg: "invalid message" };
    const postingId = _msgs[_msgs.length - 3].replace('\\', "");
    tmp = '2'
    const reactionsNum = (message.reactions || []).reduce(
      (count: number, el: any) => {
        return count + el.count;
      },
      0
    );
    tmp = '3'
    tmp = postingId
    await rp({
      method: "POST",
      uri: "https://us-central1-inner-meetup.cloudfunctions.net/updatePosting",
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
        text: JSON.stringify({ reactionsNum, postInfo, _msgs })
      },
      json: true // Automatically stringifies the body to JSON
    });
    tmp = '5'
  } catch (err) {
    await rp({
      method: "POST",
      uri:
        "https://hooks.slack.com/services/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",
      body: {
        response_type: "in_channel", // "in_channel"
        text: JSON.stringify({ err: JSON.stringify(err), tmp })
      },
      json: true // Automatically stringifies the body to JSON
    });
  }

  res.send({});
});
