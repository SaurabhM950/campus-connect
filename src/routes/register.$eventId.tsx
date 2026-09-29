import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useStore, actions, fmtDate } from "@/lib/store";

export const Route = createFileRoute("/register/$eventId")({
  head: () => ({
    meta: [
      { title: "Register for an Event — ClubHub" },
      { name: "description", content: "Sign up for a college club event in under a minute." },
      { property: "og:title", content: "Register for an Event — ClubHub" },
      { property: "og:description", content: "Sign up for a college club event in under a minute." },
    ],
  }),
  component: Register,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  college: z.string().trim().min(2, "Enter your college").max(120),
  year: z.string().min(1, "Select your year"),
  phone: z.string().trim().regex(/^[+]?[\d\s-]{7,15}$/, "Enter a valid phone number"),
});

function Register() {
  const { eventId } = Route.useParams();
  const { events } = useStore();
  const ev = events.find((e) => e.id === eventId);
  const [form, setForm] = useState({ name: "", email: "", college: "", year: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!ev) return <div className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="font-display text-3xl">Event not found</h1><Link to="/events" className="mt-4 inline-block underline">Back to events</Link></div>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    actions.register({ ...r.data, eventId });
    setDone(true);
  };

  const field = (k: keyof typeof form, label: string, type = "text") => (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="mt-1 w-full border-2 border-foreground bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary" />
      {errors[k] && <span className="text-sm text-destructive">{errors[k]}</span>}
    </label>
  );

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <span className="bg-accent px-2 py-1 text-xs font-semibold uppercase text-accent-foreground">{ev.category}</span>
        <h1 className="mt-4 font-display text-5xl">{ev.name}</h1>
        <p className="mt-3 font-medium">{fmtDate(ev.date)}</p>
        <p className="text-muted-foreground">Venue: {ev.venue}</p>
        <p className="mt-4">{ev.description}</p>
      </div>
      <div className="border-2 border-foreground bg-card p-6 shadow-[6px_6px_0_var(--foreground)]">
        {done ? (
          <div className="py-10 text-center">
            <p className="font-display text-3xl">You're in! 🎉</p>
            <p className="mt-2 text-muted-foreground">See you at {ev.name}.</p>
            <Link to="/events" className="mt-6 inline-block bg-primary px-5 py-2.5 font-semibold text-primary-foreground">More events</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <h2 className="font-display text-2xl">Registration</h2>
            {field("name", "Name")}
            {field("email", "Email", "email")}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("college", "College")}
              <label className="block">
                <span className="text-sm font-semibold">Year</span>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="mt-1 w-full border-2 border-foreground bg-card px-3 py-2.5">
                  <option value="">Select…</option>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgrad"].map((y) => <option key={y}>{y}</option>)}
                </select>
                {errors["year"] && <span className="text-sm text-destructive">{errors["year"]}</span>}
              </label>
            </div>
            {field("phone", "Phone number", "tel")}
            <button className="w-full bg-primary py-3 font-bold text-primary-foreground hover:opacity-90">Submit Registration</button>
          </form>
        )}
      </div>
    </div>
  );
}
