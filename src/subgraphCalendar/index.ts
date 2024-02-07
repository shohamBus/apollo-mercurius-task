//subgraphCalendar/index.ts

import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-express';
import { fetchCalendarData } from './fetchCalendarData';

interface Organizer {
  email?: string | null;
  displayName?: string | null; // Make displayName nullable
}

interface Event {
  id: string;
  summary?: string | null;
  location?: string | null;
  organizer?: Organizer | null;
}

interface Event {
  id: string;
  summary?: string | null;
  location?: string | null;
  organizer?: Organizer | null;
}

const typeDefs = gql`
  type Organizer {
    email: String
    displayName: String
  }

  type Event {
    id: ID!
    summary: String
    location: String
    organizer: Organizer
  }

  type Query {
    events: [Event!]!
  }
`;

const resolvers = {
  Query: {
    events: async (_parent: any, _args: any, context: { token: string }) => {
      if (context.token) {
        try {
          const calendarData: Event[] = await fetchCalendarData(context.token);
          console.log('Raw calendar data:', calendarData);

          // Ensure that the fields are not null or undefined before returning
          const sanitizedData = calendarData.map((event, index) => {
            return {
              id: event.id,
              summary: event.summary || null,
              location: event.location || null,
              organizer: event.organizer || null,
            };
          });

          console.log('Sanitized data:', sanitizedData);

          return sanitizedData;
        } catch (error: any) {
          console.error('Error fetching data from Google Calendar API:', error.message);
          throw new Error('Failed to fetch calendar data');
        }
      } else {
        throw new AuthenticationError('Invalid token');
      }
    },
  },
};

export const calendarSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
