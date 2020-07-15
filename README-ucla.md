# UCLA notes

## Set up LTI tool 
1. Startup your local Moodle on Docker
2. Go to Site administration > Plugins > Activity modules > External tool > Manage tools
3. Click on configure a tool manually
4. Enter in the following:
   Tool name: <Anything>
   Tool URL: http://localhost:8080
   LTI version: LTI 1.3
   Public key type: RSA key
   Initiate login URL: http://localhost:8080/login
   Redirection URI(s): http://localhost:8080

   Services:

   IMS LTI Assignment and Grade Services: Use this service for grade sync and column management
   IMS LTI Names and Role Provisioning: Use this service to retrieve members' information as per privacy settings
   Tool Settings: Use this service

   Privacy:

   Share launcher's name with tool: Always
   Share launcher's email with tool: Always
   Accept grades from the tool: Always

5. Click "Save changes"
6. Then under "Tools" find LTI app you just created and click on the "View configurations" icon (first icon, next to gear)
7. Copy Client ID value into PLATFORM_CLIENTID value in .env-dist file

## Set up MongoDB 
1. Install MongoDB: https://docs.mongodb.com/manual/administration/install-community/
2. Helpful to install MongoDB Compass to ensure your database is running correctly: https://www.mongodb.com/try/download/compass

## Startup app
1. Copy .env-dist to .env
2. Set LTI_KEY to any random string, and DB_DATABASE to whatever you'd like
3. Comment out DEBUG if you do not want to see the LTI provider debugging messages
4. Start app:
   yarn
   yarn dev
5. On initial load the app will display the public key
6. Copy the key, and remember to remove the '[0] ' characters from the start of each row of the key, and include the BEGIN/END PUBLIC KEY lines 

## Add public key to LTI tool
1. Go back to Manage Tools section on local CCLE (Site administration > Plugins > Activity modules > External tool > Manage tools)
2. Under Tools, find your LTI tool and click the gear icon
3. Paste your key into the Public key field
4. Save changes

## Test it out
1. Create a small test course (Site Administration > Development > Make test course), choose S, enter any name and click Create course
2. Inside the course, turn editing on, add activity or resource, choose External tool, enter any name, choose your LTI tool from Preconfigured tool, and then save
3. You should see your tool embedded in the site, and when you click User Center, 100 users should show up
