// Requiring LTIJS provider
const Lti = require('ltijs').Provider;
// const cors = require('cors');
require('dotenv').config();

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

  lti.onConnect((connection, request, response) => {
    lti.redirect(response, 'http://localhost:5000');
  });

  // lti.app.use(cors());

  // Names and Roles route
  lti.app.get('/api/members', (req, res) => {
    lti.NamesAndRoles.getMembers(res.locals.token)
      .then(members => res.send(members.members))
      .catch(err => res.status(400).send(err));
  });

  // Grades routes
  lti.app.get('/api/grades', (req, res) => {
    lti.Grade.result(res.locals.token).then(grades => res.status(200).send(grades)).catch((err) => {
      console.log(err);
      return res.status(400);
    });
  });

  lti.app.post('/api/grades', (req, res) => {
    try {
      lti.Grade.ScorePublish(res.locals.token, req.body);
      return res.status(200).send(req.body);
    } catch (err) {
      console.log(err);
      return res.status(400).send(err);
    }
  });
}

setup();
