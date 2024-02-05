// subgraphCalendar/calendar.ts
import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';

interface Event {
  id: string;
  summary: string;
  start: string;
  end: string;
}

const typeDefs = gql`
  type Event {
    id: ID!
    summary: String!
    start: String!
    end: String!
  }

  type Query {
    events: [Event!]!
  }
`;

const resolvers = {
  Query: {
    events: async () => {
      try {
        // Fetch data from Google Calendar API here
        const calendarData: Event[] = await fetchCalendarData();
        console.log('Calendar data:', calendarData); // Log the fetched data
        return calendarData;
      } catch (error:any) {
        console.error('Error fetching calendar data:', error.message);
        throw error; // Rethrow the error to handle it in the resolver
      }
    },
  },
};

export const calendarSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Fetch data function, replace with actual logic
async function fetchCalendarData(): Promise<Event[]> {
  try {
    // Implement your logic to fetch data from Google Calendar API
    // ...
    const calendarData: Event[] = []; // Replace with actual data

    console.log('Fetched data from Google Calendar API:', calendarData);

    return calendarData;
  } catch (error:any) {
    console.error('Error fetching data from Google Calendar API:', error.message);
    throw error; // Rethrow the error to handle it in the resolver
  }
}

// Create an Express app
const app = express();

// Create an ApolloServer instance
const server = new ApolloServer({ schema: calendarSchema });

// Start the server and then apply ApolloServer middleware
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql/calendar' });

  // Specify the port to listen on
  const PORT = 3001;

  // Start the server
  app.listen(PORT, () => {
    console.log(`Calendar service is running on http://localhost:${PORT}/graphql/calendar`);
  });
}

// Call the asynchronous function to start the server