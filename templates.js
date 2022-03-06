const { config } = require("./config");

exports.requestTokenTemplate = {
    blocks: [{
            type: "section",
            text: {
                type: "mrkdwn",
                text: "Oops! It looks like we don't know each other yet. Please click below button to accept me. ",
            },
        },
        {
            type: "actions",
            block_id: "actionblock789",
            elements: [{
                type: "button",
                text: {
                    type: "plain_text",
                    text: "Accept",
                },
                style: "primary",
                value: "click_me_456",
                url: config.authUrl,
            }, ],
        },
    ],
}