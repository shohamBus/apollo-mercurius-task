//subgraphPeople/fetchPeopleData.ts

import axios from 'axios';

interface Person {
  resourceName?: string;
  etag?: string;
  names: {
    displayName: string;
    familyName: string;
  }[];
}

interface GooglePeopleResponse {
  connections?: Person[];
}

export async function fetchPeopleData(accessToken: string): Promise<Person[]> {
  try {
    const response = await axios.get<GooglePeopleResponse>('https://people.googleapis.com/v1/people/me/connections', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        personFields: 'names,emailAddresses',
      },
    });

    const peopleData = response.data?.connections || [];
    const formattedData: Person[] = peopleData.map((person) => ({
      resourceName: person.resourceName || '',
      etag: person.etag || '',
      names: person.names.map(name => ({
        displayName: name.displayName || '',
        familyName: name.familyName || '',
      })),
    }));

    console.log('Formatted data:', formattedData);

    return formattedData;
  } catch (error:any) {
    console.error('Error fetching data from Google People API:', error.message);
    throw new Error('Failed to fetch People data');
  }
}
