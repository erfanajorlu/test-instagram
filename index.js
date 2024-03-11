/* tslint:disable:no-console */
const { IgApiClient } = require('instagram-private-api');

const ig = new IgApiClient();

async function login() {
  // basic login-procedure
  ig.state.generateDevice(process.env.IG_USERNAME);
  ig.state.proxyUrl = process.env.IG_PROXY;
  await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
}

(async () => {
  await login();
  try {
    // Replace 'recipientUsername' with the username of the recipient
    const recipientUsername = 'mrezat';
    const targetUser = await ig.user.searchExact(recipientUsername);
    const recipientId = targetUser.pk;
    console.log(recipientId);

    // Create a direct thread with the recipient
    const thread = ig.entity.directThread([recipientId]);

    // Send a message to the recipient
    await thread.broadcastText('سلام اقای طاهری من به شما علاقه دارم');
    
    console.log('Message sent successfully.');
  } catch (error) {
    console.error('Error sending message:', error);
  }
})();