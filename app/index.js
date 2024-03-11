/* tslint:disable:no-console */
const { IgApiClient } = require('instagram-private-api');
const dotenv = require('dotenv');
dotenv.config();


const ig = new IgApiClient();

async function login() {
  // Ensure environment variables are set
  if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
    throw new Error("Missing IG_USERNAME or IG_PASSWORD environment variables!");
  }

  // basic login-procedure
  ig.state.generateDevice(process.env.IG_USERNAME);
  // ig.state.proxyUrl = process.env.IG_PROXY;
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
}

(async () => {
  await login();

  const items = await ig.feed.directInbox().items();
  // get more[...]
  const unread = items.filter(x => x.read_state > 0);

  console.log(unread);


  // Array to store unread messages username
  const unreadUsernames = [];

  for (const thread of unread) {
    if (thread.users && thread.users.length > 0) {
      for (const user of thread.users) {
        const userInfo = await ig.user.info(user.pk);
        unreadUsernames.push(userInfo.username);
      }
    }
  };

  // Array to store unread messages text
  const unreadMessages = items.map(x =>{
    if(x.read_state > 0){
      return x.last_permanent_item.text;
    };});


  console.log('Usernames of users who have not seen their messages:', unreadUsernames);
  console.log(unreadMessages);

})();
