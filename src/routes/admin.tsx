import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, actions, CATEGORIES, fmtDate, type ClubEvent } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — ClubHub" },
      { name: "description", content: "Manage club events and view student registrations." },
      { property: "og:title", content: "Admin Dashboard — ClubHub" },
      { property: "og:description", content: "Manage club events and view student registrations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const empty = { name: "", date: "", venue: "", category: "Tech", description: "", featured: false };
const input = "w-full border-2 border-foreground bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-primary";

function Admin() {
  const { events, registrations } = useStore();
  const [tab, setTab] = useState<"events" | "regs">("events");
  const [editing, setEditing] = useState<(Omit<ClubEvent, "id"> & { id?: string }) | null>(null);
  const [q, setQ] = useState("");
  const [fEvent, setFEvent] = useState("All");
  const [fYear, setFYear] = useState("All");

  const regs = registrations.filter((r) => {
    const s = q.toLowerCase();
    return (!s || [r.name, r.email, r.college, r.phone].some((v) => v.toLowerCase().includes(s)))
      && (fEvent === "All" || r.eventId === fEvent) && (fYear === "All" || r.year === fYear);
  });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.name || !editing.date || !editing.venue) return;
    actions.saveEvent(editing);
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl md:text-5xl">Admin dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Events" value={events.length} />
        <Stat label="Registrations" value={registrations.length} />
        <Stat label="Upcoming" value={events.filter((e) => new Date(e.date) >= new Date()).length} />
      </div>

      <div className="mt-8 flex gap-2 border-b-2 border-foreground">
        {([["events", "Events"], ["regs", "Registrations"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 font-semibold ${tab === k ? "bg-foreground text-background" : ""}`}>{l}</button>
        ))}
      </div>

      {tab === "events" ? (
        <div className="mt-6">
          <button onClick={() => setEditing({ ...empty })} className="bg-primary px-4 py-2 font-semibold text-primary-foreground">+ Add event</button>
          {editing && (
            <form onSubmit={save} className="mt-6 grid gap-4 border-2 border-foreground bg-card p-5 md:grid-cols-2">
              <h2 className="font-display text-2xl md:col-span-2">{editing.id ? "Edit event" : "New event"}</h2>
              <input required placeholder="Event name" className={input} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <input required type="datetime-local" className={input} value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
              <input required placeholder="Venue" className={input} value={editing.venue} onChange={(e) => setEditing({ ...editing, venue: e.target.value })} />
              <select className={input} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <textarea placeholder="Description" rows={3} className={`${input} md:col-span-2`} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured on home page
              </label>
              <div className="flex gap-2 md:justify-end">
                <button type="button" onClick={() => setEditing(null)} className="border-2 border-foreground px-4 py-2 font-semibold">Cancel</button>
                <button className="bg-primary px-4 py-2 font-semibold text-primary-foreground">Save</button>
              </div>
            </form>
          )}
          <div className="mt-6 overflow-x-auto border-2 border-foreground">
            <table className="w-full min-w-[640px] bg-card text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-3">Event</th><th className="p-3">Date</th><th className="p-3">Venue</th><th className="p-3">Regs</th><th className="p-3"></th></tr></thead>
              <tbody>
                {[...events].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{e.featured && "★ "}{e.name}<div className="text-xs font-normal text-muted-foreground">{e.category}</div></td>
                    <td className="p-3">{fmtDate(e.date)}</td>
                    <td className="p-3">{e.venue}</td>
                    <td className="p-3">{registrations.filter((r) => r.eventId === e.id).length}</td>
                    <td className="space-x-3 whitespace-nowrap p-3 text-right">
                      <button onClick={() => setEditing({ ...e })} className="font-semibold underline">Edit</button>
                      <button onClick={() => confirm(`Delete "${e.name}"?`) && actions.deleteEvent(e.id)} className="font-semibold text-destructive underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="grid gap-3 md:grid-cols-3">
            <input placeholder="Search name, email, college, phone…" className={input} value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={input} value={fEvent} onChange={(e) => setFEvent(e.target.value)}>
              <option value="All">All events</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select className={input} value={fYear} onChange={(e) => setFYear(e.target.value)}>
              <option value="All">All years</option>
              {["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgrad"].map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="mt-6 overflow-x-auto border-2 border-foreground">
            <table className="w-full min-w-[720px] bg-card text-sm">
              <thead className="bg-muted text-left"><tr><th className="p-3">Student</th><th className="p-3">College / Year</th><th className="p-3">Phone</th><th className="p-3">Event</th><th className="p-3"></th></tr></thead>
              <tbody>
                {regs.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 font-semibold">{r.name}<div className="text-xs font-normal text-muted-foreground">{r.email}</div></td>
                    <td className="p-3">{r.college}<div className="text-xs text-muted-foreground">{r.year}</div></td>
                    <td className="p-3">{r.phone}</td>
                    <td className="p-3">{events.find((e) => e.id === r.eventId)?.name ?? "—"}</td>
                    <td className="p-3 text-right"><button onClick={() => actions.deleteRegistration(r.id)} className="text-destructive underline">Remove</button></td>
                  </tr>
                ))}
                {!regs.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No registrations found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-2 border-foreground bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-4xl">{value}</p>
    </div>
  );
}
