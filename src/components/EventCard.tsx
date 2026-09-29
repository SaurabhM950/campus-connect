import { Link } from "@tanstack/react-router";
import { type ClubEvent, fmtDate } from "@/lib/store";

export function EventCard({ e }: { e: ClubEvent }) {
  const past = new Date(e.date) < new Date();
  return (
    <article className="flex flex-col border-2 border-foreground bg-card p-5 shadow-[6px_6px_0_var(--foreground)] transition-transform hover:-translate-y-1">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="bg-accent px-2 py-1 text-accent-foreground">{e.category}</span>
        <span className="text-muted-foreground">{fmtDate(e.date)}</span>
      </div>
      <h3 className="mt-4 font-display text-2xl leading-tight">{e.name}</h3>
      <p className="mt-1 text-sm font-medium text-muted-foreground">Venue: {e.venue}</p>
      <p className="mt-3 flex-1 text-sm">{e.description}</p>
      {past ? (
        <span className="mt-5 text-center text-sm text-muted-foreground">Event ended</span>
      ) : (
        <Link to="/register/$eventId" params={{ eventId: e.id }} className="mt-5 bg-primary px-4 py-2.5 text-center font-semibold text-primary-foreground hover:opacity-90">
          Register →
        </Link>
      )}
    </article>
  );
}
