const { IgApiClient } = require('instagram-private-api');
const dotenv = require('dotenv');
const moment = require('moment');
const { withFbnsAndRealtime } = require('instagram_mqtt');
dotenv.config();

const ig = new IgApiClient();

async function login() {
    // Ensure environment variables are set
    if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
        throw new Error("Missing IG_USERNAME or IG_PASSWORD environment variables!");
    }

    // basic login-procedure
    ig.state.generateDevice(process.env.IG_USERNAME);
    ig.state.proxyUrl = process.env.IG_PROXY;
    try {
        await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
    } catch (error) {
        // Handle login errors, including rate limiting
        console.error('Error during login:', error.message);
        if (error.response && error.response.statusCode === 400) {
            console.log('Waiting for a few minutes before retrying...');
            await new Promise(resolve => setTimeout(resolve, 300000)); // Wait for 5 minutes
            await login(); // Retry login
        }
    }

};

(async () => {
    await login();

    const items = await ig.feed.directInbox().items();
    const unread = items.filter(x => x.read_state > 0);

    unread.map(msg => {
        console.log(`ThreadID: ${msg.thread_id}`);


        let date = moment(Number(msg.last_permanent_item.timestamp) / 1000);

        console.log(`Conversation with: ${msg.thread_title}`);
        console.log(`Received at: ${date}`);
        console.log(`Message: ${msg.last_permanent_item.text}`);
    });


    // Array to store usernames of users who have not seen their messages
    const unreadUsernames = [];
    for (const thread of unread) {
        if (thread.users && thread.users.length > 0) {
            for (const user of thread.users) {
                const userInfo = await ig.user.info(user.pk);
                unreadUsernames.push(userInfo.username);
            }
        }
    }

    console.log(unreadUsernames);

})();
