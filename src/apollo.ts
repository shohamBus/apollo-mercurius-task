import express, { Request, Response } from 'express';
import { config } from 'dotenv';
import { google } from 'googleapis';
import { ApolloServer } from 'apollo-server-express';
import { mergeSchemas } from '@graphql-tools/schema';
import { calendarSchema } from './subgraphCalendar';
import { peopleSchema } from './subgraphPeople';
import axios from 'axios';

config();

const app = express();
const PORT = 3000;

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
async function validateAccessTokenMiddleware(req: Request, res: Response, next: any) {
  let accessToken = req.query.accessToken || '';
  const authorizationHeader = req.headers.authorization;

  if (!accessToken && authorizationHeader) {
    const [bearer, token] = authorizationHeader.split(' ');
    if (bearer === 'Bearer' && token) {
      accessToken = token;
    }
  }

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    const tokenInfo = response.data;

    // Check if the access token has the required scope
    const hasRequiredScope = tokenInfo.scope.includes('https://www.googleapis.com/auth/calendar.readonly');
    if (!hasRequiredScope) {
      return res.status(403).json({ error: 'Insufficient scope' });
    }

    // Check if the access token is valid for the client ID
    const isValidToken = tokenInfo.audience === process.env.CLIENT_ID;
    if (!isValidToken) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    next();
  } catch (error:any) {
    console.error('Error validating access token:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware to the '/graphql' path
app.use('/graphql', validateAccessTokenMiddleware);

app.get('/', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/contacts.readonly'
    ],
  });

  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;
    console.log('accessToken', accessToken);

    // Redirect to GraphQL endpoint with access token as query parameter
    res.redirect(`/graphql?accessToken=${accessToken}`);
  } catch (error:any) {
    console.error('Error:', error.message);
    res.status(500).send('Error retrieving access token.');
  }
});

const schema = mergeSchemas({
  schemas: [calendarSchema, peopleSchema],
});

const server = new ApolloServer({
  schema,
  context: ({ req }) => {
    // Get access token from query parameter
    const token = req.query.accessToken || req.headers.authorization?.split(' ')[1];
    return { token };
  },
});

server.start().then(() => {
  server.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});