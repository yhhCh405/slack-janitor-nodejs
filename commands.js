const { async } = require("@firebase/util");
const { WebClient } = require("@slack/web-api");
const { deleteDoc } = require("firebase/firestore");
const { post } = require("request");
const { findUsersById } = require("./firestore_service");
const { requestTokenTemplate } = require("./templates");

exports.cmd = async (req, res, db) => {
  switch (req.body.command) {
    case "/delete-conversation":
      deleteConversation(db, req);
      return res.status(200).send("Alright! I'm processing. Please wait.");
    case "/message-bomb":
      messageBomb(db, req);
      return res.status(200).send("Alright! I'm processing. Please wait.");
    case "/forget-me":
      forgetMe(db, req, res);
      return res.status(200).send("Alright! I'm processing. Please wait.");
    case "/about":
      return about(req, res);
    default:
      return res.status(200).send("Oops! I don't understand what you mean.");
  }
};

async function forgetMe(db, req, res) {
  const users = await findUsersById(db, req.body.user_id, req.body.team_id);
  for (const u of users.docs) {
    deleteDoc(u.ref).catch((e) => {
      post(req.body.response_url, {
        json: { text: `Oops! Failed to forget you. ${JSON.stringify(e)}` },
      });
    });
  }
  return post(req.body.response_url, {
    json: { text: `Done!` },
  });
}

function about(req, res) {
  return res.status(200).json({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Mingalabar *<@${req.body.user_id}>*\n I was created by Ye Htet Hein to clean everything. :grimacing:`,
        },
      },
    ],
  });
}

async function getUserInfo(db, req) {
  const users = await findUsersById(db, req.body.user_id, req.body.team_id);
  if (users.docs.length < 1) {
    return undefined;
  }
  return {
    token: users.docs[0].data()["authed_user"]["access_token"],
  };
}

async function deleteConversation(db, req) {
  try {
    const userInfo = await getUserInfo(db, req);
    if (!userInfo) {
      return post(req.body.response_url, { json: requestTokenTemplate });
    }
    const client = new WebClient(userInfo.token);
    let nextCursor = null;
    let hasMore = true;

    while (hasMore) {
      const convList = await client.conversations.history({
        channel: req.body.channel_id,
        cursor: nextCursor,
      });
      nextCursor = convList.response_metadata?.next_cursor;
      hasMore = convList.has_more ?? false;
      for (const c of convList.messages) {
        if (c.user == req.body.user_id) {
          client.chat
            .delete({ channel: req.body.channel_id, ts: c.ts })
            .catch((e) => {
              console.log("Failed to delete a message ->", e);
              post(req.body.response_url, {
                text: "Oops! Failed to delete a message",
              });
            });
        }
      }
    }
    return post(req.body.response_url, {
      json: { text: `Conversation delete operation triggered!` },
    });
  } catch (error) {
    console.log(`Error in deletion --> ${error}`);
    return post(req.body.response_url, {
      json: { text: `Oops! operation failed. ${JSON.stringify(error)}` },
    });
  }
}

async function messageBomb(db, req) {
  try {
    const userInfo = await getUserInfo(db, req);
    if (!userInfo) {
      return post(req.body.response_url, { json: requestTokenTemplate });
    }
    const client = new WebClient(userInfo.token);
    const limit = req.body.text ?? 100;
    for (let i = 0; i < limit; i++) {
      await client.chat.postMessage({
        token: userInfo.token,
        channel: req.body.channel_id,
        text: i.toString(),
      });
    }
    return post(req.body.response_url, {
      json: { text: `All automation messages are sent` },
    });
  } catch (error) {
    console.log(`Error in messageBomb --> ${error}`);
    return post(req.body.response_url, {
      json: { text: `Oops! operation failed. ${JSON.stringify(error)}` },
    });
  }
}
