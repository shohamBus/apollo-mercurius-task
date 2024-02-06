//peopleSchema.ts

import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-express';
import { isValidToken } from '../utils/utils';

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
      if (isValidToken(context.token)) {
        const peopleData: Person[] = await fetchPeopleData();
        return peopleData;
      } else {
        throw new AuthenticationError('Invalid token');
      }
    },
  },
};

async function fetchPeopleData(): Promise<Person[]> {
  try {
    const peopleData: Person[] = []; // Replace with actual data
    console.log('Fetched data from Google People API:', peopleData);
    return peopleData;
  } catch (error: any) {
    console.error('Error fetching data from Google People API:', error.message);
    throw error;
  }
}

export const peopleSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
