import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, CATEGORIES } from "@/lib/store";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "All Events — ClubHub" },
      { name: "description", content: "Search and filter every club event by name and category." },
      { property: "og:title", content: "All Events — ClubHub" },
      { property: "og:description", content: "Search and filter every club event by name and category." },
    ],
  }),
  component: Events,
});

function Events() {
  const { events } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = events
    .filter((e) => e.name.toLowerCase().includes(q.toLowerCase()) && (cat === "All" || e.category === cat))
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl">All events</h1>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events by name…" className="w-full border-2 border-foreground bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-primary md:max-w-sm" />
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`border-2 border-foreground px-3 py-1.5 text-sm font-semibold ${cat === c ? "bg-foreground text-background" : "bg-card"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => <EventCard key={e.id} e={e} />)}
      </div>
      {!list.length && <p className="mt-10 text-muted-foreground">No events match your search.</p>}
    </div>
  );
}
