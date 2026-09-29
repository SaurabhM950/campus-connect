import { useSyncExternalStore } from "react";

export type ClubEvent = {
  id: string;
  name: string;
  date: string; // ISO datetime-local
  venue: string;
  category: string;
  description: string;
  featured?: boolean;
};
export type Registration = {
  id: string;
  eventId: string;
  name: string;
  email: string;
  college: string;
  year: string;
  phone: string;
  createdAt: string;
};

export const CATEGORIES = ["Tech", "Cultural", "Sports", "Workshop", "Seminar"];

const seed: ClubEvent[] = [
  { id: "e1", name: "HackNight 2026", date: "2026-10-18T18:00", venue: "Main Auditorium", category: "Tech", description: "A 12-hour overnight hackathon. Form teams, build something bold, win prizes.", featured: true },
  { id: "e2", name: "Autumn Music Fest", date: "2026-10-25T17:30", venue: "Open Air Theatre", category: "Cultural", description: "Live bands, solo acts and an open mic to close out the evening." },
  { id: "e3", name: "Intro to UI Design", date: "2026-11-02T14:00", venue: "Lab 204, CS Block", category: "Workshop", description: "Hands-on session covering layout, type and color fundamentals." },
  { id: "e4", name: "Inter-College Football Cup", date: "2026-11-09T09:00", venue: "University Ground", category: "Sports", description: "Knockout tournament with 16 teams from across the city." },
  { id: "e5", name: "Careers in AI Talk", date: "2026-11-15T11:00", venue: "Seminar Hall B", category: "Seminar", description: "Industry speakers on breaking into AI research and engineering." },
];

const KEY = "clubhub-v1";
type State = { events: ClubEvent[]; registrations: Registration[] };
let state: State = { events: seed, registrations: [] };
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
const serverState: State = { events: seed, registrations: [] };

export function useStore() {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => serverState,
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const actions = {
  saveEvent(e: Omit<ClubEvent, "id"> & { id?: string }) {
    let events = state.events;
    if (e.featured) events = events.map((x) => ({ ...x, featured: false }));
    if (e.id) events = events.map((x) => (x.id === e.id ? ({ ...e } as ClubEvent) : x));
    else events = [...events, { ...e, id: uid() }];
    set({ ...state, events });
  },
  deleteEvent(id: string) {
    set({ events: state.events.filter((e) => e.id !== id), registrations: state.registrations.filter((r) => r.eventId !== id) });
  },
  register(r: Omit<Registration, "id" | "createdAt">) {
    set({ ...state, registrations: [...state.registrations, { ...r, id: uid(), createdAt: new Date().toISOString() }] });
  },
  deleteRegistration(id: string) {
    set({ ...state, registrations: state.registrations.filter((r) => r.id !== id) });
  },
};

export const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
