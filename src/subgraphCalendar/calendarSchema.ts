//calendarSchema.ts

import { isValidToken } from "../utils/utils";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { AuthenticationError } from 'apollo-server-express';
import { gql } from 'apollo-server-express';

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
      events: async (parent: any, args: any, context: { token: string }) => {
        // Validate the token in context.token
        if (isValidToken(context.token)) {
          // Proceed with fetching calendar data
          const calendarData: Event[] = await fetchCalendarData();
          return calendarData;
        } else {
          // Handle authentication error
          throw new AuthenticationError('Invalid token');
        }
      },
    },
    
  };
  
  // Fetch data function, replace with actual logic
async function fetchCalendarData(): Promise<Event[]> {
    try {
      // Implement your logic to fetch data from Google Calendar API
      // ...
      const calendarData: Event[] = []; // Replace with actual data
  
      console.log('Fetched data from Google Calendar API:', calendarData);
  
      return calendarData;
    } catch (error: any) {
      console.error('Error fetching data from Google Calendar API:', error.message);
      throw error; // Rethrow the error to handle it in the resolver
    }
  }
  
  
  export const calendarSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });