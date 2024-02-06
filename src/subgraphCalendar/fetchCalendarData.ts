//fetchCalendarData.ts
import axios from 'axios';

interface Organizer {
  email?: string | null;
  displayName?: string | null; 
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

interface GoogleCalendarResponse {
  items?: {
    id: string;
    summary?: string | null;
    location?: string | null;
    creator?: { email: string };
    organizer?: { email: string; displayName?: string } | null;
  }[];
}

export async function fetchCalendarData(accessToken: string): Promise<Event[]> {
  try {
    const response = await axios.get<GoogleCalendarResponse>('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data || !response.data.items) {
      throw new Error('Invalid response from Google Calendar API');
    }

    const calendarData = response.data.items;

    console.log('Raw calendar data:', calendarData);

    const formattedData: Event[] = calendarData.map((event) => {
      return {
        id: event.id,
        summary: event.summary,
        location: event.location,
        organizer: event.organizer
          ? {
              email: event.organizer.email || null,
              displayName: event.organizer.displayName != null ? event.organizer.displayName : null,
            }
          : null, 
      };
    });

    console.log('Formatted data:', formattedData);

    return formattedData;
  } catch (error: any) {
    if (error.response) {
      console.error('Error response from Google Calendar API:', error.response.data);
    } else if (error.request) {
      console.error('No response received from Google Calendar API:', error.request);
    } else {
      console.error('Error fetching data from Google Calendar API:', error.message);
    }
    throw new Error('Failed to fetch calendar data');
  }
}