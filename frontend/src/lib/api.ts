// api.ts - Simple API service to communicate with Express/SQLite backend
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export type EventCategory = 'Workshop' | 'Competition' | 'Hackathon' | 'Community' | 'Social';

export interface ClubEvent {
  id: number;
  name: string;
  title: string;
  slug: string;
  tagline: string;
  category: EventCategory;
  date: string;
  dateLabel: string;
  time: string;
  venue: string;
  description: string;
  full_description: string;
  about: string;
  image?: string;
  capacity: number;
  organizer: string;
  is_past: number;
  past: boolean;
  featured?: boolean;
  attendeeCount: number;
  learn: string[];
  schedule: { time: string; label: string; detail: string }[];
  attendance: string;
  visual: 'branch' | 'terminal' | 'sprint' | 'social' | 'rocket';
}

export interface RegistrationPayload {
  event_id: number;
  name: string;
  email: string;
  college?: string;
}

export interface RegistrationResult {
  success: boolean;
  message: string;
}

/**
 * Fetch events from backend with optional filters
 */
export async function getEvents(params?: { category?: string; search?: string; past?: boolean }): Promise<ClubEvent[]> {
  const queryParams = new URLSearchParams();
  if (params?.category && params.category !== 'All') {
    queryParams.append('category', params.category);
  }
  if (params?.search && params.search.trim()) {
    queryParams.append('search', params.search.trim());
  }
  if (params?.past !== undefined) {
    queryParams.append('past', String(params.past));
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const response = await fetch(`${API_BASE_URL}/events${queryString}`);

  if (!response.ok) {
    throw new Error('Unable to load events. Please try again.');
  }

  return response.json();
}

/**
 * Fetch a single event by ID or slug
 */
export async function getEventById(idOrSlug: string | number): Promise<ClubEvent> {
  const response = await fetch(`${API_BASE_URL}/events/${idOrSlug}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Event not found');
    }
    throw new Error('Unable to load event details. Please try again.');
  }

  return response.json();
}

/**
 * Submit an event registration
 */
export async function submitRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
  const response = await fetch(`${API_BASE_URL}/registrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed. Please check your details and try again.');
  }

  return data;
}

/**
 * Fetch current registration count for an event
 */
export async function getRegistrationCount(eventId: number | string): Promise<{ event_id: number; count: number }> {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}/registrations/count`);
  if (!response.ok) {
    throw new Error('Failed to fetch participant count');
  }
  return response.json();
}
