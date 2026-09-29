import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, fmtDate } from "@/lib/store";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ClubHub — College Club Events" },
      { name: "description", content: "Discover and register for upcoming college club events." },
      { property: "og:title", content: "ClubHub — College Club Events" },
      { property: "og:description", content: "Discover and register for upcoming college club events." },
    ],
  }),
  component: Home,
});

function Home() {
  const { events } = useStore();
  const upcoming = events.filter((e) => new Date(e.date) >= new Date()).sort((a, b) => a.date.localeCompare(b.date));
  const featured = events.find((e) => e.featured) ?? upcoming[0];
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <p className="font-semibold uppercase tracking-widest text-primary">The Student Activities Club</p>
        <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.95] md:text-7xl">Where campus life actually happens.</h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          We run hackathons, fests, workshops and tournaments all year round. Find something you love, sign up in seconds, and show up.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/events" className="bg-primary px-6 py-3 font-semibold text-primary-foreground">Browse events</Link>
          <a href="#upcoming" className="border-2 border-foreground px-6 py-3 font-semibold">What's next</a>
        </div>
      </section>

      {featured && (
        <section className="border-y-2 border-foreground bg-foreground text-background">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-accent">★ Featured event</p>
              <h2 className="mt-3 font-display text-4xl md:text-6xl">{featured.name}</h2>
              <p className="mt-3 opacity-80">{fmtDate(featured.date)} · {featured.venue}</p>
              <p className="mt-4 max-w-2xl opacity-90">{featured.description}</p>
            </div>
            <Link to="/register/$eventId" params={{ eventId: featured.id }} className="bg-accent px-8 py-4 text-center font-bold text-accent-foreground">
              Grab your spot
            </Link>
          </div>
        </section>
      )}

      <section id="upcoming" className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-4xl">Upcoming</h2>
          <Link to="/events" className="font-semibold underline underline-offset-4">All events</Link>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((e) => <EventCard key={e.id} e={e} />)}
          {!upcoming.length && <p className="text-muted-foreground">No upcoming events yet.</p>}
        </div>
      </section>
    </div>
  );
}
