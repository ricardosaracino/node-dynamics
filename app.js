process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
})


const DynamicsWebApi = require('dynamics-web-api');
const AuthenticationContext = require('adal-node').AuthenticationContext;


const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {

    return res.send('Hello World!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// https://us.hitachi-solutions.com/blog/service-endpoints-authentication-and-integration-apps-in-dynamics-365-for-operations/
// https://www.npmjs.com/package/dynamics-web-api


// Select Azure Active Directory > Properties > Directory ID in the Azure portal//OAuth Token Endpoint
//  "Grant Permission" for your app at https://portal.azure.com. Let me know if that fixes it.

const authorityUrl = 'https://login.microsoftonline.com/a5df5a73-cdac-446d-bcc7-630c7823057c/oauth2/token';
//CRM Organization URL
const resource = 'https://equasion2.crm3.dynamics.com/';



//Dynamics 365 Client Id when registered in Azure (MAKE SURE NATIVE)
const clientId = '3333c14a-7a3c-4a5b-b5c9-74cb02631e7f'; // ApplicationID
const username = 'mikeo@tctdtsdemo1.onmicrosoft.com';
const password = 'XXX';

// const clientSecret


// https://login.microsoftonline.com/a5df5a73-cdac-446d-bcc7-630c7823057c/oauth2/authorize?client_id=30c7dae3-da8a-4ae1-b989-943320c11608&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A12345&response_mode=query&resource=https%3A%2F%2Fservice.contoso.com%2F&state=12345


const adalContext = new AuthenticationContext(authorityUrl);

//add a callback as a parameter for your function
function acquireToken(dynamicsWebApiCallback){
    //a callback for adal-node
    function adalCallback(error, token) {
        if (!error){
            //call DynamicsWebApi callback only when a token has been retrieved
            dynamicsWebApiCallback(token);
        }
        else{
            console.log('Token has not been retrieved. Error: ' + error.stack);
        }
    }

    //call a necessary function in adal-node object to get a token
    adalContext.acquireTokenWithUsernamePassword(resource, username, password, clientId, adalCallback);
}

//create DynamicsWebApi object
const dynamicsWebApi = new DynamicsWebApi({
    webApiUrl: 'https:/equasion2.api.crm.dynamics.com/api/data/v8.2/', // was 9.0
    onTokenRefresh: acquireToken
});

//call any function
dynamicsWebApi.executeUnboundFunction("WhoAmI").then(function (response) {
    console.log('Hello Dynamics 365! My id is: ' + response.UserId);
}).catch(function(error){
    console.log(error.message);
});