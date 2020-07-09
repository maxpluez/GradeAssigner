// Requiring path
const path = require('path');
// Loading environment variables
require('dotenv').config();

// Requiring LTIJS provider
const Lti = require('ltijs').Provider;

// Creating a provider instance
const lti = new Lti(
  process.env.LTI_KEY,
  // Setting up database configurations
  {
    url: `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}`,
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  },
  { appUrl: '/', loginUrl: '/login', logger: true }
);

async function setup() {
  // Deploying provider, connecting to the database and starting express server.
  await lti.deploy();
  // Register Moodle as a platform
  const plat = await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: 'Local Moodle',
    clientId: process.env.PLATFORM_CLIENTID,
    authenticationEndpoint: process.env.PLATFORM_ENDPOINT,
    accesstokenEndpoint: process.env.PLATFORM_TOKEN_ENDPOINT,
    authConfig: {
      method: 'JWK_SET',
      key: process.env.PLATFORM_KEY_ENDPOINT
    }
  });

  // Get the public key generated for that platform
  console.log(await plat.platformPublicKey());

  // Set connection callback
  lti.onConnect((connection, request, response) => {
    // Call redirect function
    lti.redirect(response, '/main');
  });

  // Set main endpoint route
  lti.app.get('/main', (req, res) => {
    // Id token
    console.log(res.locals.token);
    res.send('Connection successful!');
  });

  // Names and Roles route
  lti.app.get('/api/members', async (req, res) => {
    try {
      console.log(res.locals.token);
      const result = await lti.NamesAndRoles.getMembers(res.locals.token);
      console.log(result);
      return res.send(result);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });
}

setup();
