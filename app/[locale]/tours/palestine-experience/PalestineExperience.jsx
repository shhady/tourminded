"use client";

/*
  DIRECTION CONTRACT
  THESIS: One real trip shown as the route it travels. The page is the
  itinerary — a single gold thread from Jerusalem back to Jerusalem.
  Days collapse to their essence (day, place, one line) and open to the
  full story on demand. Refuses the category default: hero + amenity
  icons + generic accordion + price table.
  OWN-WORLD (inherited from landing): warm near-black #1a1814 ground,
  ivory #f5efe6 / #e9e1d3 text, gold #c9a96b thread and accents,
  hairline gold gradients, black/45 glass, serif display with one
  italic gold moment, tracked uppercase micro-labels, rounded-[20px].
  STORY: A visitor from the landing wants specifics. They follow the
  thread through seven days, open the days that call to them, read the
  honest answers in the FAQ, and end at two doors: book a call, or
  write to us.
  FIRST VIEWPORT: full-bleed still — travelers overlooking the wall at
  golden hour. Micro-label, display "The Palestine Experience.", gold
  deck line, route, gold CTA to #inquire, quiet CTA to #route.
  FORM/SIGNATURE: the drawing thread — a scroll-driven gold line down
  the weekday-named stops; each stop is a door that opens.
*/

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const ROUTE = [
  "Jerusalem",
  "Bethlehem",
  "Hebron",
  "Nablus",
  "Ramallah",
  "Jericho",
  "Beit Ummar",
  "South Hebron Hills",
];

const DAYS = [
  {
    id: "day-1",
    day: "Day 1",
    weekday: "Monday",
    title: "Greater Jerusalem and the Old City",
    lead: "Begin with the places everyone knows, then see what surrounds them.",
    paragraphs: [
      "At 9:00 in the morning, you will meet the group at the Jerusalem Hotel Café. The journey begins with a briefing using maps to help you understand the route, the geography, and the political reality you will encounter during the week.",
      "From there, you will take an alternative tour through Jerusalem's Old City. You will visit the Western Wall and the Church of the Holy Sepulchre, while also seeing the Israeli settler homes established throughout the Muslim Quarter. Your guide will explain how Israeli settlement activity is changing the Old City and the Palestinian neighbourhoods surrounding it.",
      "After lunch, you will leave the centre of Jerusalem and travel through the wider city. The route includes the settlements of Pisgat Ze'ev and Har Homa, the Palestinian neighbourhoods of Beit Hanina and Anata, the Separation Barrier, and the segregated road system that shapes how people move through the area.",
      "By the end of the day, you will have seen both the historic centre shown to millions of visitors and the wider system that is usually left outside the tour.",
      "In the evening, you will travel to Beit Sahour and meet the Palestinian family who will host you.",
    ],
  },
  {
    id: "day-2",
    day: "Day 2",
    weekday: "Tuesday",
    title: "Bethlehem and Hebron",
    lead: "Two cities shaped by walls, settlements, faith, and resistance.",
    paragraphs: [
      "Today you will travel with a Palestinian guide through Bethlehem and Hebron. The day begins by looking back toward Har Homa, the settlement you saw from Jerusalem the previous day. This time, you will see it from the Palestinian side of the Separation Barrier.",
      "You will walk beside the wall surrounding Bethlehem and learn how it affects the movement, land, economy, and everyday lives of local Palestinians. The wall has also become a public canvas: you will see political art and graffiti created by Palestinian and international artists, including work associated with Banksy.",
      "At Aida Refugee Camp, you will meet a representative from the local youth centre. You will have the opportunity to speak with people from the camp, hear their personal stories, and understand what life looks like inside a refugee camp that has existed for generations.",
      "You will then visit the Walled Off Hotel. Its museum explains the history and present reality of the occupation through art and historical material, while its gallery provides Palestinian artists with a space to exhibit their work. From there, you will continue to Manger Square, the Church of the Nativity, and Bethlehem's Old City.",
      "Later, the journey continues south to Hebron. Along the road, you will see Israeli settlements and learn about the home demolitions and movement restrictions affecting Palestinians in the area.",
      "Inside Hebron, you will visit the Tomb of Abraham and walk through the city's market. Parts of this once-thriving commercial centre have been emptied or placed under severe restrictions as Israeli settler strongholds have expanded inside the city. There will also be time to shop from Palestinian traders who continue working in the market.",
    ],
  },
  {
    id: "day-3",
    day: "Day 3",
    weekday: "Wednesday",
    title: "Nablus",
    lead: "Travel north through the centre of the West Bank.",
    paragraphs: [
      "You will be picked up early and travel north along Route 60, the main road running through the spine of the West Bank. Along the journey, you will pass Palestinian villages and numerous Israeli settlements.",
      "Your first major stop is the Samaritan village on Mount Gerizim. The Samaritans are one of the world's smallest and oldest religious communities. You will learn about their history, traditions, and how the community has survived despite the pressures and changes around it.",
      "From Mount Gerizim, you will continue to Balata Refugee Camp. You will see the camp's crowded living conditions, hear stories about life there, and visit a local organization working to support residents.",
      "The journey then moves into Nablus itself. You will walk through the Old City's labyrinth of Ottoman buildings, visit the traditional Turkish baths, and see how olive-oil soap is produced in one of the city's historic factories. You will also visit Jacob's Well, the deep well traditionally associated with Jacob and with the story of Jesus speaking to a Samaritan woman.",
      "Nablus brings together religion, commerce, craft, refugee life, and thousands of years of history inside one living city.",
    ],
  },
  {
    id: "day-4",
    day: "Day 4",
    weekday: "Thursday",
    title: "Ramallah and Jericho",
    lead: "From the modern Palestinian capital to one of the world's oldest cities.",
    paragraphs: [
      "You will leave Bethlehem and travel around the eastern side of Jerusalem through the Judean Desert toward Ramallah. Along the route, you will see Israeli settlements positioned across the landscape.",
      "You will enter Ramallah through a checkpoint into Kufr Aqab. Although Kufr Aqab is officially part of the Jerusalem municipality and its residents pay Jerusalem city taxes, the Separation Wall cuts the neighbourhood off from the rest of the city. Your guide will explain what this contradiction means for the people living there.",
      "In Ramallah, you will visit Yasser Arafat's tomb and walk through the streets of the bustling city that now serves as the de facto political and administrative capital of Palestinians in the West Bank. Ramallah offers a different view of Palestinian life: a city of government offices, businesses, cafés, shops, universities, families, cultural life, and constant movement.",
      "After lunch, you will travel east to Jericho. You will see the Mount of Temptation before exploring the ancient city itself. The afternoon includes Tel es-Sultan, the archaeological mound associated with ancient Jericho, and Hisham's Palace, known for its architecture and remarkably preserved mosaics.",
      "The day moves between the present-day political centre of the West Bank and a city whose history reaches back thousands of years.",
    ],
  },
  {
    id: "day-5",
    day: "Day 5",
    weekday: "Friday",
    title: "Beit Ummar village",
    lead: "Leave the tour route and enter village life.",
    paragraphs: [
      "You will travel south from Bethlehem to the Palestinian village of Beit Ummar. On arrival, you will meet your host, Mousa, and settle into his family home, where you will spend the next three nights.",
      "Accommodation is in comfortable dormitory-style rooms inside the family home. The house has shared lounge areas, a balcony, outdoor spaces, and wireless internet. Hot drinks are always available in the kitchen. You are invited to help yourself and make the house feel like home.",
      "You can sit beneath an olive tree, spend time with the family, use the lounge, or step outside and walk through the village.",
      "During the day, Mousa will take you through Beit Ummar to meet local families and learn about their lives. You will hear how land confiscation, settlement expansion, and settler activity affect the village and the families living there. Beit Ummar is a Palestinian Muslim village located between Bethlehem and Hebron, inside the area dominated by Israel's Gush Etzion settlement bloc.",
      "The formal activities are only part of the experience. You are encouraged to walk around, meet residents, sit with people, and absorb the rhythm of the village. The nearby countryside also offers space to walk among the olive groves.",
    ],
  },
  {
    id: "day-6",
    day: "Day 6",
    weekday: "Saturday",
    title: "Beit Ummar",
    lead: "Farmers, land, and non-violent resistance.",
    paragraphs: [
      "In the morning, you will visit farmers in their fields and homes around the village. You will see firsthand how Israeli settlements have been built on confiscated Palestinian land and what this means for the people trying to continue farming nearby.",
      "You will also learn about the Palestine Solidarity Project. People in Beit Ummar have developed different forms of non-violent resistance to the occupation. These activities include accompanying farmers when there is a risk of settler violence, replanting trees that have been destroyed, and resisting home demolitions.",
      "The village has also established a women's embroidery cooperative. You will learn about the cooperative's work and meet local activists involved in organizing and protecting the community.",
      "The day is not structured around watching Palestinian resistance from a distance. It gives you the opportunity to speak directly with the people doing the work, understand why it is necessary, and learn what solidarity looks like in practice.",
    ],
  },
  {
    id: "day-7",
    day: "Day 7",
    weekday: "Sunday",
    title: "South Hebron Hills",
    lead: "Meet the communities refusing to disappear.",
    paragraphs: [
      "You will travel with Mousa into the South Hebron Hills. Along the way, you will pass Kiryat Arba, a major Israeli settlement built on the edge of Hebron.",
      "The day focuses on Palestinian communities living under continued pressure from settlements and settlers. Many families in the region have lost access to large parts of their land and face harassment when attempting to cultivate fields near settlements.",
      "Some residents live in shacks, tents, or caves while fighting to remain on land their families have lived on for generations. You will visit these communities, meet residents, and hear directly about their lives.",
      "This is often the most difficult day of the journey. It is also one of the most important.",
      "The people you meet are not simply waiting to be rescued or reduced to symbols of suffering. They are raising families, caring for animals, cultivating land, organizing their communities, and continuing to live under conditions designed to make remaining difficult.",
    ],
  },
  {
    id: "day-return",
    day: "Monday morning",
    weekday: null,
    title: "Return to Jerusalem",
    lead: "After breakfast, you will leave Beit Ummar and return to Jerusalem.",
    paragraphs: [
      "You can travel by public transportation or arrange a private car in advance. Your host will explain where and how to take public transport from the village. Private transfers must be arranged before departure, with the details provided separately.",
      "The organized journey ends when you return to Jerusalem. What you do with what you have seen begins afterward.",
    ],
  },
];

const FAQ = [
  {
    id: "faq-safety",
    question: "Is it safe to travel to Jerusalem and the West Bank?",
    paragraphs: [
      "Yes. Major destinations like Jerusalem, Bethlehem, Ramallah, Jericho, and Hebron welcome travelers every day.",
      "Our guides live here and follow real-time updates, choosing the safest routes and adjusting plans if needed. If anything changes on the ground, you'll be informed immediately.",
    ],
  },
  {
    id: "faq-customize",
    question: "Can I customize my tour?",
    paragraphs: [
      "Yes, every tour can be tailored to your interests. Whether you want more history, more food, more politics, or a more spiritual experience, your guide will adjust the itinerary to match your style.",
    ],
  },
  {
    id: "faq-money",
    question: "Where does my money go?",
    paragraphs: [
      "This journey is designed to support Palestinian people directly. Your payment supports Palestinian guides, drivers, host families, community organizations, local businesses, craftspeople, and the people welcoming you into their homes and villages.",
      "You are not only learning about Palestine. Your visit helps sustain the communities that make the experience possible.",
    ],
  },
  {
    id: "faq-wear",
    question: "What should I wear?",
    paragraphs: [
      "Several parts of the journey take place in conservative Palestinian communities and at religious sites.",
      "Both men and women should wear modest clothing that covers the chest, shoulders, upper arms, and knees. Long trousers, long skirts, and dresses below the knee are appropriate. Shorts should not be worn during the guided program.",
      "Following local expectations shows respect to the families and communities welcoming you and makes it easier to communicate comfortably with local people. Your guides will explain when any additional clothing or behaviour is expected.",
    ],
  },
  {
    id: "faq-meals",
    question: "Are meals included?",
    paragraphs: [
      "Home-cooked meals with your host families are an important part of the experience. Other included meals will be listed clearly in your booking information.",
      "Please tell us in advance about allergies, dietary restrictions, or religious requirements. We will do our best to accommodate them.",
    ],
  },
];

const EXTRAS = [
  {
    title: "Extra nights with your host family",
    detail: "Stay longer with your host family after the organized tour ends.",
  },
  {
    title: "Private transportation",
    detail:
      "Arrange a private transfer to the Monday morning meeting point or from Beit Ummar at the end of the journey.",
  },
  {
    title: "Bethlehem hotel upgrade",
    detail:
      "Choose hotel accommodation in Bethlehem instead of the standard host-family stay.",
  },
];

function PlusIcon({ open, small }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center rounded-full border border-[#c9a96b]/40 transition group-hover:border-[#c9a96b]/80 ${
        small ? "h-7 w-7" : "mt-1 h-8 w-8 sm:h-9 sm:w-9"
      }`}
    >
      <span
        className={`absolute h-px w-3.5 bg-[#c9a96b] transition-transform duration-300 ${
          open ? "rotate-180" : ""
        }`}
      />
      <span
        className={`absolute h-px w-3.5 bg-[#c9a96b] transition-transform duration-300 ${
          open ? "rotate-180" : "rotate-90"
        }`}
      />
    </span>
  );
}

export default function PalestineExperience() {
  const params = useParams();
  const locale = params?.locale || "en";

  const [scrolled, setScrolled] = useState(false);
  const routeRef = useRef(null);
  const threadRef = useRef(null);
  const rafRef = useRef(0);
  const tickingRef = useRef(false);

  const [openDays, setOpenDays] = useState(() => new Set());
  const [openFaqs, setOpenFaqs] = useState(() => new Set());

  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const toggle = (setter) => (id) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleDay = toggle(setOpenDays);
  const toggleFaq = toggle(setOpenFaqs);

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
    // Days expanding/collapsing change the section height without a scroll.
    const ro = new ResizeObserver(onScroll);
    ro.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      ro.disconnect();
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
  const revealCls =
    "translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100";

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
            aria-label="Talk to us about the trip"
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
                Seven full days &middot; Seven nights &middot; Monday to Monday
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#f5efe6] sm:text-6xl md:text-7xl">
                The Palestine
                <span className="block italic text-[#c9a96b]">Experience.</span>
              </h1>
              <p className="mt-6 font-serif text-xl italic leading-snug text-[#e9e1d3] sm:text-2xl">
                See Palestine through the people who live here.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#e9e1d3]/90 sm:text-lg">
                A Palestinian-led journey from Jerusalem to the South Hebron
                Hills, created for first-time visitors who want to understand
                the country beyond its headlines and holy sites.
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
                  Talk to us about the trip
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

        <section className="relative px-5 pt-20 sm:px-8 sm:pt-28">
          <div className="mx-auto w-full max-w-3xl">
            <div data-reveal className={revealCls}>
              <p className="text-lg leading-relaxed text-[#e9e1d3]/90 sm:text-xl">
                You will walk through Jerusalem&apos;s Old City, visit
                Bethlehem and Hebron, travel north to Nablus, explore Ramallah
                and ancient Jericho, and spend three nights with Mousa&apos;s
                family in the village of Beit Ummar.
              </p>
              <p className="mt-6 text-base leading-relaxed text-[#e9e1d3]/80 sm:text-lg">
                Along the way, you will meet Palestinian families, guides,
                farmers, activists, craftspeople, and refugee camp residents.
                You will eat in local homes, walk through cities and villages,
                and see how occupation, history, faith, resistance, and
                everyday life exist beside one another.
              </p>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-3xl">
            <div data-reveal className={revealCls}>
              <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl">
                You want to visit Palestine.
                <span className="block italic text-[#c9a96b]">
                  We make the journey possible.
                </span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                Many people want to come, but do not know where to begin.
              </p>
              <p className="mt-5 border-l border-[#c9a96b]/50 pl-5 font-serif text-lg italic leading-relaxed text-[#e9e1d3] sm:text-xl">
                Can I enter? Is it safe? Where should I stay? How will I move
                between cities? Who can I trust? How do I make sure my visit
                supports Palestinians?
              </p>
              <p className="mt-6 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                The Palestine Experience removes the uncertainty of planning
                the journey alone. The route is prepared. Your guides, drivers,
                hosts, and local contacts are Palestinian. Before you arrive,
                we help you understand the logistics and what to expect.
                Throughout the trip, you travel with people who know the
                roads, communities, checkpoints, and changing conditions on
                the ground.
              </p>
              <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                This does not mean placing you inside a protected tourist
                bubble. You will see walls, settlements, checkpoints,
                segregated roads, refugee camps, land confiscation, and
                communities living under pressure.
              </p>
              <p className="mt-8 font-serif text-xl italic leading-snug text-[#c9a96b] sm:text-2xl">
                But Palestine is not only what has been done to it.
              </p>
              <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                You will also see family homes, markets, ancient streets,
                olive groves, workshops, places of worship, village life,
                hospitality, humour, and people building full lives under
                difficult circumstances.
              </p>
              <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                This trip brings those realities together.
              </p>
            </div>
          </div>
        </section>

        <section id="route" className="relative px-5 py-8 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto w-full max-w-4xl">
            <div data-reveal className={`mb-14 max-w-2xl sm:mb-18 ${revealCls}`}>
              <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                Monday to Monday
              </p>
              <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl md:text-5xl">
                The journey.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/85 sm:text-lg">
                It begins Monday at 9:00 at the Jerusalem Hotel Caf&eacute;
                and ends the following Monday morning back in Jerusalem. Open
                any day to read it in full.
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

              <ol className="space-y-10 sm:space-y-14">
                {DAYS.map((d, i) => {
                  const open = openDays.has(d.id);
                  const last = i === DAYS.length - 1;
                  return (
                    <li key={d.id} className="relative pl-10 sm:pl-16">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[10px] flex h-[11px] w-[11px] items-center justify-center sm:h-[15px] sm:w-[15px]"
                      >
                        {last ? (
                          <span className="absolute inset-0 rounded-full bg-[#c9a96b]" />
                        ) : (
                          <>
                            <span className="absolute inset-0 rounded-full border border-[#c9a96b]/60" />
                            <span className="h-[3px] w-[3px] rounded-full bg-[#c9a96b] sm:h-[5px] sm:w-[5px]" />
                          </>
                        )}
                      </span>

                      <div data-reveal className={revealCls}>
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-controls={`${d.id}-panel`}
                          onClick={() => toggleDay(d.id)}
                          suppressHydrationWarning
                          className={`group block w-full rounded-lg text-left ${focusRing}`}
                        >
                          <span className="block text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/55 sm:text-xs">
                            {d.day}
                            {d.weekday && (
                              <>
                                {" "}
                                &middot; {d.weekday}
                              </>
                            )}
                          </span>
                          <span className="mt-2 block font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] transition group-hover:text-white sm:text-3xl md:text-4xl">
                            {d.title}
                          </span>
                          <span className="mt-1 block font-serif text-base italic text-[#c9a96b] sm:text-lg">
                            {d.lead}
                          </span>
                          <span className="mt-4 inline-flex items-center gap-2.5">
                            <PlusIcon open={open} small />
                            <span className="text-[9px] uppercase tracking-[0.24em] text-[#e9e1d3]/45 transition group-hover:text-[#c9a96b] sm:text-[10px]">
                              {open ? "Close" : "Read the day"}
                            </span>
                          </span>
                        </button>

                        <div
                          id={`${d.id}-panel`}
                          role="region"
                          aria-label={`${d.day}: ${d.title}`}
                          className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <div className="max-w-[62ch] space-y-4 pt-4">
                              {d.paragraphs.map((p, j) => (
                                <p
                                  key={j}
                                  className="text-[15px] leading-[1.7] text-[#e9e1d3]/85 sm:text-base"
                                >
                                  {p}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {i === 1 && (
                        <figure
                          data-reveal
                          className={`mt-12 -ml-10 sm:-ml-16 ${revealCls}`}
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
                          className={`mt-12 -ml-10 sm:-ml-16 ${revealCls}`}
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
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-4xl">
            <div
              data-reveal
              className={`relative overflow-hidden rounded-[20px] border border-white/10 bg-black/45 p-7 backdrop-blur-xl sm:p-10 md:p-12 ${revealCls}`}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96b]/70 to-transparent"
              />
              <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                FAQ
              </p>
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-3xl">
                Frequently asked questions.
              </h2>

              <div className="mt-6 divide-y divide-white/10">
                {FAQ.map((f) => {
                  const open = openFaqs.has(f.id);
                  return (
                    <div key={f.id}>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`${f.id}-panel`}
                        onClick={() => toggleFaq(f.id)}
                        suppressHydrationWarning
                        className={`group flex w-full items-start justify-between gap-4 rounded-lg py-5 text-left ${focusRing}`}
                      >
                        <span className="text-base font-medium leading-snug text-[#f5efe6] transition group-hover:text-white sm:text-lg">
                          {f.question}
                        </span>
                        <PlusIcon open={open} />
                      </button>
                      <div
                        id={`${f.id}-panel`}
                        role="region"
                        aria-label={f.question}
                        className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="max-w-[62ch] space-y-3 pb-5">
                            {f.paragraphs.map((p, j) => (
                              <p
                                key={j}
                                className="text-[15px] leading-[1.7] text-[#e9e1d3]/85 sm:text-base"
                              >
                                {p}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative px-5 py-10 sm:px-8 sm:py-16">
          <div className="mx-auto w-full max-w-4xl">
            <div data-reveal className={revealCls}>
              <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96b] sm:text-xs">
                On request
              </p>
              <h2 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-3xl">
                Optional extras.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[#e9e1d3]/75 sm:text-base">
                The following can be arranged on request and are subject to
                availability.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                {EXTRAS.map((x) => (
                  <div
                    key={x.title}
                    className="rounded-[20px] border border-white/10 bg-black/30 p-6 backdrop-blur"
                  >
                    <h3 className="text-[15px] font-semibold leading-snug text-[#f5efe6] sm:text-base">
                      {x.title}
                    </h3>
                    <p className="mt-2 text-sm leading-[1.65] text-[#e9e1d3]/75">
                      {x.detail}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[15px] leading-relaxed text-[#e9e1d3]/75 sm:text-base">
                Please{" "}
                <a
                  href="#inquire"
                  className={`text-[#c9a96b] underline decoration-[#c9a96b]/50 underline-offset-4 transition hover:text-[#d6b87b] ${focusRing}`}
                >
                  contact us
                </a>{" "}
                before booking to discuss availability and pricing.
              </p>
            </div>
          </div>
        </section>

        <section id="inquire" className="relative px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-3xl">
            <div data-reveal className={revealCls}>
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
                      suppressHydrationWarning
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
                      suppressHydrationWarning
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
                    suppressHydrationWarning
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
                    suppressHydrationWarning
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
                  suppressHydrationWarning
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
