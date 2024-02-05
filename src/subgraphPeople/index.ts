import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { AuthenticationError } from 'apollo-server-express';
import { isValidToken } from '../utils/utils'; // Import isValidToken from utils

interface Person {
  id: string;
  name: string;
  email: string;
}

const typeDefs = gql`
  type Person {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    people: [Person!]!
  }
`;

const resolvers = {
  Query: {
    people: async (_parent: any, _args: any, context: { token: string }) => {
      // Validate the token in context.token
      if (isValidToken(context.token)) {
        // Proceed with fetching people data
        const peopleData: Person[] = await fetchPeopleData();
        return peopleData;
      } else {
        // Handle authentication error
        throw new AuthenticationError('Invalid token');
      }
    },
  },
};

export const peopleSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Fetch data function, replace with actual logic
async function fetchPeopleData(): Promise<Person[]> {
  try {
    // Implement your logic to fetch data from Google People API
    // ...
    const peopleData: Person[] = []; // Replace with actual data

    console.log('Fetched data from Google People API:', peopleData);

    return peopleData;
  } catch (error: any) {
    console.error('Error fetching data from Google People API:', error.message);
    throw error; // Rethrow the error to handle it in the resolver
  }
}

// Create an Express app
const app = express();

// Create an ApolloServer instance
const server = new ApolloServer({ schema: peopleSchema });

// Start the server and then apply ApolloServer middleware
async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql/people' });

  // Specify the port to listen on
  const PORT = 4002;

  // Start the server
  app.listen(PORT, () => {
    console.log(`People service is running on http://localhost:${PORT}/graphql/people`);
  });
}

// Call the asynchronous function to start the server
startServer();
