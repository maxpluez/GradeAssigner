// Requiring LTIJS provider
const Lti = require('ltijs').Provider;
// const cors = require('cors');

// Creating a provider instance
const lti = new Lti(
  'SAMPLEKEY',
  // Setting up database configurations
  { url: 'mongodb://localhost/ltimoodle' }
);

async function setup() {
  // Deploying provider, connecting to the database and starting express server.
  await lti.deploy();
  // Register Moodle as a platform
  await lti.registerPlatform({
    url: 'http://localhost:8000',
    name: 'Local Moodle',
    clientId: 'o41NEeEz3FUJzXm',
    authenticationEndpoint: 'http://localhost:8000/mod/lti/auth.php',
    accesstokenEndpoint: 'http://localhost:8000/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      key: 'http://localhost:8000/mod/lti/certs.php'
    }
  });

  lti.onConnect((connection, request, response) => {
    lti.redirect(response, 'http://localhost:5000');
  });

  // lti.app.use(cors());

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
