// src/subgraphCalendar/index.ts

import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-express';
import { isValidToken } from '../utils/utils';

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
    events: async (_parent: any, _args: any, context: { token: string }) => {
      if (isValidToken(context.token)) {
        const calendarData: Event[] = await fetchCalendarData();
        return calendarData;
      } else {
        throw new AuthenticationError('Invalid token');
      }
    },
  },
};

async function fetchCalendarData(): Promise<Event[]> {
  try {
    const calendarData: Event[] = []; // Replace with actual data
    console.log('Fetched data from Google Calendar API:', calendarData);
    return calendarData;
  } catch (error: any) {
    console.error('Error fetching data from Google Calendar API:', error.message);
    throw error;
  }
}

export const calendarSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
