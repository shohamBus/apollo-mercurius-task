
import express from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway } from '@apollo/gateway';
import { config } from 'dotenv';
import { calendarSchema } from './subgraphCalendar/index';
import { peopleSchema } from './subgraphPeople/index';
import axios from 'axios';
import { google } from 'googleapis';

config();

const app: Application = express();

// Your OAuth 2.0 credentials
const credentials = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  redirect_uris: [process.env.REDIRECT_URI],
};

// Your OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

// Middleware for validating access token
async function validateAccessTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
    const isValidToken = response.data.audience === process.env.CLIENT_ID;

    if (!isValidToken) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    next();
  } catch (error: any) {
    console.error('Error validating access token:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

app.get('/', (req: Request, res: Response) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
  });

  res.redirect(authUrl);
});

app.use('/secure', validateAccessTokenMiddleware);

app.get('/secure/data', (req: Request, res: Response) => {
  res.json({ message: 'Secure data accessed' });
});

app.get('/oauth2callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const accessToken = tokens.access_token;

    res.send('Access Token retrieved. Check the console.');
  } catch (error: any) {
    console.error('Error:', error.message);
    res.status(500).send('Error retrieving access token.');
  }
});

// Wrap the asynchronous part in a function
async function startServer() {
  // Google Calendar API Subgraph
  const calendarService = new ApolloServer({ schema: calendarSchema });
  calendarService.applyMiddleware({ app, path: '/graphql/calendar' });

  // Google People API Subgraph
  const peopleService = new ApolloServer({ schema: peopleSchema });
  peopleService.applyMiddleware({ app, path: '/graphql/people' });

  // GraphQL Gateway Configuration
  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'calendar', url: `http://localhost:3001/graphql/calendar` },
      { name: 'people', url: `http://localhost:3002/graphql/people` },
    ],
  });

  const gatewayServer = new ApolloServer({
    gateway,
    // @ts-ignore
    subscriptions: false,
  });

  // Wait for the gateway server to start
  await gatewayServer.start();

  // Apply ApolloServer middleware to the '/graphql' path
  gatewayServer.applyMiddleware({ app, path: '/graphql' });

  // Start the server
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
