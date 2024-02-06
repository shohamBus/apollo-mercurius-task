// src/subgraphPeople/index.ts

import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { peopleSchema } from './peopleSchema';

const app = express();
const port = 3002;

const server = new ApolloServer({
  schema: peopleSchema,
});

export async function startPeopleServer() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql/people' });

  app.listen({ port }, () => {
    console.log(`People service is running at http://localhost:${port}/graphql/people`);
  });
}

