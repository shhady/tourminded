"use client";

/*
  DIRECTION CONTRACT
  THESIS: One real trip shown as the route it travels. The page is the
  itinerary — a single gold thread from Jerusalem back to Jerusalem.
  Refuses the category default: hero + amenity icons + accordion + price table.
  OWN-WORLD (inherited from landing): warm near-black #1a1814 ground, ivory
  #f5efe6 / #e9e1d3 text, gold #c9a96b thread and accents, hairline gold
  gradients, black/45 glass, serif display with one italic gold moment,
  tracked uppercase micro-labels, rounded-[20px].
  STORY: A visitor from the landing wants specifics. They follow the thread
  through seven days and the people who host them, read the practical truths
  (including that price is set in conversation, not a table), and end at two
  doors: book a call, or write to us.
  FIRST VIEWPORT: full-bleed still — travelers overlooking the wall at golden
  hour. Micro-label, serif display "The Palestine Experience.", route line,
  one promise paragraph, gold CTA to #inquire, quiet CTA to #route.
  FORM/SIGNATURE: the drawing thread — a scroll-driven gold line down the
  seven weekday-named stops; two film stills pace the scroll.
*/

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const ROUTE = [
  "Jerusalem",
  "Bethlehem",
  "Nablus",
  "Ramallah",
  "Hebron",
  "Beit Ummar",
  "South Hebron Hills",
];

const DAYS = [
  {
    day: "Day 1",
    weekday: "Monday",
    place: "Jerusalem",
    lead: "The Old City, then the ring around it",
    body: "We start with a briefing, then walk the Old City — the Western Wall, the Church of the Holy Sepulchre, and the settler homes wedged into the Muslim Quarter. In the afternoon we drive the ring: Pisgat Ze'ev, Har Homa, Beit Hanina, Anata — the Separation Barrier and the segregated roads that shape daily life. In the evening we go down to Beit Sahour to meet the family hosting you.",
  },
  {
    day: "Day 2",
    weekday: "Tuesday",
    place: "Bethlehem",
    lead: "A city inside a wall",
    body: "A local guide walks you through Bethlehem: the Separation Wall that wraps the city and the Banksy pieces on it, Aida refugee camp with someone from its youth centre, and the Walled Off Hotel's museum and gallery. Then Manger Square and the Church of the Nativity, and out to Mar Saba, hanging over the Judean desert. The evening is yours — Bethlehem after dark.",
  },
  {
    day: "Day 3",
    weekday: "Wednesday",
    place: "Nablus",
    lead: "Up the spine of the West Bank",
    body: "An early run north on Route 60. On Mount Gerizim we visit a Samaritan village; in the city, Balata refugee camp, then the Ottoman old city — the Turkish baths, an olive-oil soap factory, and Jacob's Well, dug deep into the rock.",
  },
  {
    day: "Day 4",
    weekday: "Thursday",
    place: "Ramallah & Hebron",
    lead: "Two cities, one day",
    body: "Through the Judean desert, past the settlements that watch the road. We enter Ramallah through the Kufr Aqab checkpoint, stop at Arafat's tomb, and walk the city's streets. Then Hebron: the Tomb of Abraham, an old city where settlers and Palestinians live meters apart, and a glass-blowing workshop that has outlasted all of it.",
  },
  {
    day: "Day 5",
    weekday: "Friday",
    place: "Beit Ummar",
    lead: "The village takes you in",
    body: "South past Bethlehem to the village of Beit Ummar. Mousa and his family open the home where you'll sleep the next three nights. In the afternoon we walk the village with local families and hear, on the land itself, what confiscation looks like up close.",
  },
  {
    day: "Day 6",
    weekday: "Saturday",
    place: "Beit Ummar",
    lead: "Farmers, fields, and quiet resistance",
    body: "Mornings in the fields and homes around the village. You'll meet the Palestine Solidarity Project and learn how non-violent resistance works here — accompanying farmers to their land, replanting uprooted trees, standing against home demolitions — and visit the women's embroidery cooperative.",
  },
  {
    day: "Day 7",
    weekday: "Sunday",
    place: "South Hebron Hills",
    lead: "The people who stay",
    body: "With Mousa into the South Hebron Hills, past the settlement of Kiryat Arba, to villages holding on under pressure — families living in shacks, tents, and caves on land they refuse to leave. It is the hardest day, and the one people talk about longest.",
  },
];

const FACTS = [
  {
    term: "Departure",
    detail: "Mondays at 9:00, from the Jerusalem Hotel Cafe, Jerusalem.",
  },
  {
    term: "Length",
    detail: "Seven days and seven nights. You're back in Jerusalem the following Monday morning, by bus or arranged car.",
  },
  {
    term: "Where you sleep",
    detail: "With a host family in Beit Sahour, then in the family home of your hosts in Beit Ummar.",
  },
  {
    term: "Who leads it",
    detail: "Palestinian guides, drivers, and hosts, start to finish.",
  },
  {
    term: "Around the table",
    detail: "Home-cooked food with the people who host you.",
  },
  {
    term: "Dates & price",
    detail: "Set with each group. Ask us and we'll walk you through everything.",
  },
];

export default function PalestineExperience() {
  const params = useParams();
  const locale = params?.locale || "en";

  const [scrolled, setScrolled] = useState(false);
  const routeRef = useRef(null);
  const threadRef = useRef(null);
  const rafRef = useRef(0);
  const tickingRef = useRef(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The signature moment: the route thread draws itself as you travel the page.
  useEffect(() => {
    const section = routeRef.current;
    const thread = threadRef.current;
    if (!section || !thread) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      thread.style.transform = "scaleY(1)";
      return;
    }

    const update = () => {
      tickingRef.current = false;
      const rect = section.getBoundingClientRect();
      const lead = window.innerHeight * 0.7;
      const progress = clamp((lead - rect.top) / rect.height, 0, 1);
      thread.style.transform = `scaleY(${progress})`;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.setAttribute("data-revealed", "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "true");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch("/api/landing-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          message: `[Palestine Experience — 7 day trip]\n${form.message}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send.");
      setSubmitStatus({ ok: true });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setSubmitStatus({ error: err.message || "Failed to send." });
    } finally {
      setSubmitting(false);
    }
  };

  const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96b]";

  return (
    <div className="relative min-h-screen w-full bg-[#1a1814] text-[#f5efe6] antialiased">
      <header className="fixed top-0 left-0 right-0 z-50">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-0 -bottom-6 transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-transparent" />
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <Link
            href={`/${locale}/landing`}
            aria-label="Back to Watermelon Tours home"
            className={`rounded-sm ${focusRing}`}
          >
            <Image
              src="/logo1.png"
              alt="Watermelon Tours Logo"
              width={240}
              height={96}
              priority
              className="h-10 w-auto md:h-16 lg:h-18"
            />
          </Link>

          <a
            href="#inquire"
            aria-label="Talk to us about this trip"
            className={`rounded-full border border-[#c9a96b]/60 bg-[#c9a96b]/10 px-4 py-2 text-sm font-medium text-[#f5efe6] backdrop-blur transition hover:bg-[#c9a96b]/25 sm:px-5 ${focusRing}`}
          >
            Talk to Us
          </a>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-end sm:items-center">
          <div className="absolute inset-0">
            <Image
              src="/frames/palestine/frame-260.jpg"
              alt="Three travelers at an overlook at sunset, facing the Separation Wall winding through the hills"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-[#1a1814]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/25"
            />
          </div>

          <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-20 sm:px-8 sm:pb-28">
            <div className="max-w-3xl">
              <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                The one trip we run &middot; 7 days / 7 nights
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#f5efe6] sm:text-6xl md:text-7xl">
                The Palestine
                <span className="block italic text-[#c9a96b]">Experience.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#e9e1d3]/90 sm:text-lg md:text-xl">
                Seven days from Jerusalem to the South Hebron Hills and back —
                led by Palestinian guides, slept in family homes, eaten at
                family tables. This is the route we take to show you the
                country as it is.
              </p>

              <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-[#e9e1d3]/70 sm:text-xs">
                {ROUTE.map((place, i) => (
                  <span key={place} className="flex items-center gap-x-2">
                    {i > 0 && (
                      <span aria-hidden="true" className="text-[#c9a96b]/70">
                        &rarr;
                      </span>
                    )}
                    <span>{place}</span>
                  </span>
                ))}
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="#inquire"
                  className={`inline-flex items-center justify-center rounded-full bg-[#c9a96b] px-7 py-3.5 text-sm font-semibold text-[#1a1814] shadow-lg shadow-black/30 transition hover:bg-[#d6b87b] sm:text-base ${focusRing}`}
                >
                  Talk to us about this trip
                </a>
                <a
                  href="#route"
                  className={`inline-flex items-center justify-center rounded-full border border-[#f5efe6]/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-[#f5efe6] backdrop-blur transition hover:bg-white/10 sm:text-base ${focusRing}`}
                >
                  Follow the route &darr;
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="route" className="relative px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-4xl">
            <div data-reveal className="mb-16 max-w-2xl translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 sm:mb-20">
              <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                Monday to Monday
              </p>
              <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl md:text-5xl">
                Seven days, one thread.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                The trip runs on real weekdays because the country does:
                markets, checkpoints, Friday in the village, Sunday in the
                hills. Here is where the thread goes.
              </p>
            </div>

            <div ref={routeRef} className="relative">
              <div
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-[5px] w-px bg-[#f5efe6]/10 sm:left-[7px]"
              />
              <div
                ref={threadRef}
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-[5px] w-px origin-top bg-gradient-to-b from-[#c9a96b] via-[#c9a96b]/80 to-[#c9a96b]/40 sm:left-[7px]"
                style={{ transform: "scaleY(0)", willChange: "transform" }}
              />

              <ol className="space-y-14 sm:space-y-20">
                {DAYS.map((d, i) => (
                  <li key={d.day} className="relative pl-10 sm:pl-16">
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-[6px] flex h-[11px] w-[11px] items-center justify-center sm:h-[15px] sm:w-[15px]"
                    >
                      <span className="absolute inset-0 rounded-full border border-[#c9a96b]/60" />
                      <span className="h-[3px] w-[3px] rounded-full bg-[#c9a96b] sm:h-[5px] sm:w-[5px]" />
                    </span>

                    <div
                      data-reveal
                      className="translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100"
                    >
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/55 sm:text-xs">
                        {d.day} &middot; {d.weekday}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-3xl md:text-4xl">
                        {d.place}
                      </h3>
                      <p className="mt-1 font-serif text-base italic text-[#c9a96b] sm:text-lg">
                        {d.lead}
                      </p>
                      <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[#e9e1d3]/85 sm:text-base">
                        {d.body}
                      </p>
                    </div>

                    {i === 1 && (
                      <figure
                        data-reveal
                        className="mt-12 -ml-10 translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 sm:-ml-16"
                      >
                        <div className="relative h-[42vh] min-h-[280px] overflow-hidden rounded-[20px] sm:h-[54vh]">
                          <Image
                            src="/frames/palestine/frame-100.jpg"
                            alt="Travelers and a Palestinian family laughing over tea in an old city courtyard"
                            fill
                            sizes="(max-width: 896px) 100vw, 896px"
                            className="object-cover"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10"
                          />
                        </div>
                        <figcaption className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/50 sm:text-xs">
                          Tea first. Questions after.
                        </figcaption>
                      </figure>
                    )}

                    {i === 4 && (
                      <figure
                        data-reveal
                        className="mt-12 -ml-10 translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 sm:-ml-16"
                      >
                        <div className="relative h-[42vh] min-h-[280px] overflow-hidden rounded-[20px] sm:h-[54vh]">
                          <Image
                            src="/frames/palestine/frame-001.jpg"
                            alt="A girl in embroidered dress picking olives on a sunlit grove road"
                            fill
                            sizes="(max-width: 896px) 100vw, 896px"
                            className="object-cover"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/10"
                          />
                        </div>
                        <figcaption className="mt-3 text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/50 sm:text-xs">
                          Olive season in the south.
                        </figcaption>
                      </figure>
                    )}
                  </li>
                ))}

                <li className="relative pl-10 sm:pl-16">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[6px] flex h-[11px] w-[11px] items-center justify-center sm:h-[15px] sm:w-[15px]"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#c9a96b]" />
                  </span>
                  <div
                    data-reveal
                    className="translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100"
                  >
                    <p className="text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/55 sm:text-xs">
                      Monday, again
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-3xl md:text-4xl">
                      Back to Jerusalem
                    </h3>
                    <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[#e9e1d3]/85 sm:text-base">
                      After breakfast we head back the way we came, by bus or
                      arranged car. The thread ends where it began — you
                      don&apos;t.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-4xl">
            <div
              data-reveal
              className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/45 p-7 backdrop-blur-xl translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 sm:p-10 md:p-12"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96b]/70 to-transparent"
              />
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-3xl">
                The practical part
              </h2>
              <dl className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {FACTS.map((f) => (
                  <div key={f.term}>
                    <dt className="text-[10px] uppercase tracking-[0.28em] text-[#c9a96b]/90 sm:text-xs">
                      {f.term}
                    </dt>
                    <dd className="mt-2 text-[15px] leading-[1.65] text-[#e9e1d3]/85 sm:text-base">
                      {f.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section id="inquire" className="relative px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-3xl">
            <div
              data-reveal
              className="translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100"
            >
              <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                The next step is a conversation
              </p>
              <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl md:text-5xl">
                Come sit with us first.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                Tell us who you are and what&apos;s pulling you here. We&apos;ll
                answer honestly — about safety, logistics, entry, dates, and
                whether this trip is right for you.
              </p>

              <div className="mt-8">
                <a
                  href="https://calendly.com/shakkour-boulos/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-full bg-[#c9a96b] px-7 py-3.5 text-sm font-semibold text-[#1a1814] shadow-lg shadow-black/30 transition hover:bg-[#d6b87b] sm:text-base ${focusRing}`}
                >
                  Book a 20-minute interview
                </a>
              </div>

              <form onSubmit={handleSubmit} className="mt-12 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#e9e1d3]/55 sm:text-xs">
                  Or write to us about this trip
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-[#e9e1d3]/60">
                      Name
                    </span>
                    <input
                      required
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f5efe6] outline-none transition focus:border-[#c9a96b]/60 focus:bg-white/[0.07] ${focusRing}`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 flex items-baseline gap-2 text-[10px] uppercase tracking-[0.22em] text-[#e9e1d3]/60">
                      Phone
                      <span className="tracking-normal text-[#e9e1d3]/40 normal-case">
                        (optional)
                      </span>
                    </span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f5efe6] outline-none transition focus:border-[#c9a96b]/60 focus:bg-white/[0.07] ${focusRing}`}
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-[#e9e1d3]/60">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-[#f5efe6] outline-none transition focus:border-[#c9a96b]/60 focus:bg-white/[0.07] ${focusRing}`}
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.22em] text-[#e9e1d3]/60">
                    Message
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="When you'd like to travel, who's coming, and what you want to ask."
                    className={`w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm leading-relaxed text-[#f5efe6] outline-none transition placeholder:text-[#e9e1d3]/35 focus:border-[#c9a96b]/60 focus:bg-white/[0.07] ${focusRing}`}
                  />
                </label>

                {submitStatus?.error && (
                  <p className="text-sm text-rose-300/90">{submitStatus.error}</p>
                )}
                {submitStatus?.ok && (
                  <p className="text-sm text-emerald-300/90">
                    Thanks — we&apos;ll be in touch soon.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center justify-center rounded-full border border-[#c9a96b]/60 bg-[#c9a96b]/10 px-7 py-3 text-sm font-semibold text-[#f5efe6] transition hover:bg-[#c9a96b]/25 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base ${focusRing}`}
                >
                  {submitting ? "Sending…" : "Send"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 bg-black/60 px-5 py-8 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[#e9e1d3]/70 sm:flex-row">
          <span>
            <span className="text-[#c9a96b]">Watermelon</span>Tours
          </span>
          <span>Travel as a human, not a tourist.</span>
        </div>
      </footer>
    </div>
  );
}
