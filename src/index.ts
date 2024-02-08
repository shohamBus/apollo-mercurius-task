import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import mercurius from 'mercurius';
import { config } from 'dotenv';
import { google } from 'googleapis';
import { mergeSchemas } from '@graphql-tools/schema';
import { calendarSchema } from './subgraphCalendar';
import { peopleSchema } from './subgraphPeople';
// import axios from 'axios';
import { renderPlaygroundPage } from 'graphql-playground-html'; // Import renderPlaygroundPage function

config();

const app: FastifyInstance = fastify();

// Your OAuth 2.0 credentials
const credentials = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uris: [process.env.REDIRECT_URI],
};

const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Middleware for validating access token
// async function validateAccessTokenMiddleware(req: any, reply: any) {
//   let accessToken = req.query.accessToken || '';
//   const authorizationHeader = req.headers.authorization;

//   if (!accessToken && authorizationHeader) {
//     const [bearer, token] = authorizationHeader.split(' ');
//     if (bearer === 'Bearer' && token) {
//       accessToken = token;
//     }
//   }

//   if (!accessToken) {
//     reply.status(401).send({ error: 'Access token missing' });
//     return;
//   }

//   try {
//     const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
//     const tokenInfo = response.data;

//     // Check if the access token has the required scope
//     const hasRequiredScope = tokenInfo.scope.includes('https://www.googleapis.com/auth/calendar.readonly');
//     if (!hasRequiredScope) {
//       reply.status(403).send({ error: 'Insufficient scope' });
//       return;
//     }

//     // Check if the access token is valid for the client ID
//     const isValidToken = tokenInfo.audience === process.env.CLIENT_ID;
//     if (!isValidToken) {
//       reply.status(401).send({ error: 'Invalid access token' });
//       return;
//     }

//     return;
//   } catch (error:any ) {
//     console.error('Error validating access token:', error.message);
//     reply.status(500).send({ error: 'Internal server error' });
//     return;
//   }
// }

// Apply middleware to the '/graphql' path
app.register(mercurius, {
  schema: mergeSchemas({ schemas: [calendarSchema, peopleSchema] }),
  path: '/graphql',
  context: (req, reply) => {
    return { token: (req.query as any).accessToken || req.headers.authorization?.split(' ')[1] };
  },
});

// Route handler for GraphQL Playground
app.get('/playground', async (req, reply) => {
  // Check if access token is provided
  const accessToken = (req.query as any).accessToken || req.headers.authorization?.split(' ')[1];
  
  if (!accessToken) {
    // If access token is not provided, return an error response
    reply.status(401).send({ error: 'Access token missing' });
    return;
  }

  // If access token is provided, render the GraphQL Playground page
  reply.type('text/html').send(renderPlaygroundPage({ endpoint: '/graphql' }));
});


app.get('/', async (req, reply) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/contacts.readonly'
    ],
  });

  reply.redirect(authUrl);
});

app.get('/oauth2callback', async (req, reply) => {
  const code = (req.query as any).code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    console.log('accessToken', accessToken);

    // Redirect to GraphQL Playground with access token as query parameter
    reply.redirect(`/playground?accessToken=${accessToken}`);
  } catch (error:any) {
    console.error('Error:', error.message);
    reply.status(500).send('Error retrieving access token.');
  }
});

app.listen(3000, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
