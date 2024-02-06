// //peopleSchema.ts

// import { ApolloServer, gql } from 'apollo-server-express';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { AuthenticationError } from 'apollo-server-express';
// import { isValidToken } from '../utils/utils'; // Import isValidToken from utils

// interface Person {
//     id: string;
//     name: string;
//     email: string;
//   }
  
//   const typeDefs = gql`
//     type Person {
//       id: ID!
//       name: String!
//       email: String!
//     }
  
//     type Query {
//       people: [Person!]!
//     }
//   `;


// // Fetch data function, replace with actual logic
// async function fetchPeopleData(): Promise<Person[]> {
//     try {
//       // Implement your logic to fetch data from Google People API
//       // ...
//       const peopleData: Person[] = []; // Replace with actual data
  
//       console.log('Fetched data from Google People API:', peopleData);
  
//       return peopleData;
//     } catch (error: any) {
//       console.error('Error fetching data from Google People API:', error.message);
//       throw error; // Rethrow the error to handle it in the resolver
//     }
//   }
  
  
//   const resolvers = {
//     Query: {
//       people: async (_parent: any, _args: any, context: { token: string }) => {
//         // Validate the token in context.token
//         if (isValidToken(context.token)) {
//           // Proceed with fetching people data
//           const peopleData: Person[] = await fetchPeopleData();
//           return peopleData;
//         } else {
//           // Handle authentication error
//           throw new AuthenticationError('Invalid token');
//         }
//       },
//     },
//   };
  
//   export const peopleSchema = makeExecutableSchema({
//     typeDefs,
//     resolvers,
//   });
// peopleSchema.ts
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
