//subgraphPeople/index.ts

import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-express';
import { fetchPeopleData } from './fetchPeopleData';

interface Name {
  displayName: string;
  familyName: string;
}

interface Person {
  resourceName?: string;
  etag?: string;
  names: Name[];
}

const typeDefs = gql`
  type Name {
    displayName: String!
    familyName: String!
  }

  type Person {
    resourceName: String!
    etag: String
    names: [Name!]!
  }

  type Query {
    getContacts: [Person!]!
  }
`;

const resolvers = {
  Query: {
    getContacts: async (_parent: any, _args: any, context: { token: string }) => {
      if (context.token) {
        try {
          const peopleData: Person[] = await fetchPeopleData(context.token);
          console.log('peopleData', peopleData);
          return peopleData;
        } catch (error: any) {
          console.error('Error fetching data from Google People API:', error.message);
          throw new Error('Failed to fetch People data');
        }
      } else {
        throw new AuthenticationError('Invalid token');
      }
    },
  },
};

export const peopleSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
