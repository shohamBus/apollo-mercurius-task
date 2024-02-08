import { FastifyInstance } from 'fastify';
import fastify from 'fastify';
import mercurius from 'mercurius';
import { config } from 'dotenv';
import { google } from 'googleapis';
import { mergeSchemas } from '@graphql-tools/schema';
import { calendarSchema } from './subgraphCalendar';
import { peopleSchema } from './subgraphPeople';
import { renderPlaygroundPage } from 'graphql-playground-html'; // Import renderPlaygroundPage function

config();

const app: FastifyInstance = fastify();

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

    reply.redirect(`/playground?accessToken=${accessToken}`);
  } catch (error:any) {
    console.error('Error:', error.message);
    reply.status(500).send('Error retrieving access token.');
  }
});

app.listen({ port: 3000 })
  .then(address => {
    console.log(`Server listening on ${address}`);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });