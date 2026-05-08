"use client";

import { useEffect, useRef, useState } from "react";

const sections = [
  {
    eyebrow: "Meet the people",
    title: "Meet the people and hear their stories",
    body: "Share meals, conversations, and everyday moments with locals, families, artists, organizers, and people whose lives are usually spoken about, but rarely listened to. You'll hear personal stories from people living the reality every day.",
    align: "left",
  },
  {
    eyebrow: "Taste the land",
    title: "Eat the food",
    body: "Taste Palestine through home-cooked meals, local restaurants, markets, bakeries, coffee, and knafeh.",
    align: "right",
  },
  {
    eyebrow: "See clearly",
    title: "Understand the reality",
    body: "See the difference between Palestinian neighborhoods, settlements, checkpoints, walls, and roads. Understand the reality with local guides who explain what you are seeing with care, context, and honesty.",
    align: "left",
  },
  {
    eyebrow: "Travel with intention",
    title: "Know where your money goes",
    body: "We prioritize Palestinian guides, drivers, hosts, restaurants, guesthouses, artists, and community partners, so your trip supports local people directly.",
    align: "right",
  },
  {
    eyebrow: "You are not alone",
    title: "Feel supported",
    body: "A trip for people who care, but don't know where to start. Many people want to visit Palestine but feel overwhelmed by safety, logistics, entry, or planning. We help you understand what to expect and travel with people who know the ground.",
    align: "left",
  },
];

export default function LandingPage() {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState(null);

  useEffect(() => {
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    setVideoSrc(
      isMobile
        ? "/videos/palestine-bg-mobile.mp4"
        : "/videos/palestine-bg.mp4"
    );
  }, []);

  // Some mobile browsers (notably iOS Safari) don't always honor the autoplay
  // attribute on hydration — kick play() once after the video element mounts.
  useEffect(() => {
    if (!videoSrc) return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, [videoSrc]);

  return (
    <div className="relative min-h-screen w-full bg-[#1a1814] text-[#f5efe6] antialiased">
      <div className="pointer-events-none fixed inset-0 z-0">
        {videoSrc && (
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30"
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <a
            href="#top"
            className="text-xl font-semibold tracking-wide text-[#f5efe6] sm:text-2xl"
          >
            <span className="text-[#c9a96b]">Tour</span>Minded
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#about" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">About</a>
            <a href="#trips" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">Trips</a>
            <a href="#why" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">Why Palestine</a>
            <a href="#faq" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">FAQ</a>
          </nav>

          <a
            href="#talk"
            aria-label="Talk to us"
            className="rounded-full border border-[#c9a96b]/60 bg-[#c9a96b]/10 px-4 py-2 text-sm font-medium text-[#f5efe6] backdrop-blur transition hover:bg-[#c9a96b]/25 sm:px-5"
          >
            Talk to Us
          </a>
        </div>
      </header>

      <main id="top" className="relative z-10">
        <section className="relative flex min-h-screen items-center px-5 pt-28 pb-16 sm:px-8 sm:pt-32 sm:pb-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#c9a96b] sm:text-sm">
                A documentary travel experience
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-[#f5efe6] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                Visit Palestine
                <span className="block text-[#e9e1d3]">as a human,</span>
                <span className="block italic text-[#c9a96b]">not a tourist.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-[#e9e1d3]/90 sm:text-lg md:text-xl">
                Meet locals. Eat where they eat. Walk the land. Hear the stories. Understand the reality beyond the headlines and see it with your own eyes.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="#interview"
                  aria-label="Book a 20-minute interview"
                  className="inline-flex items-center justify-center rounded-full bg-[#c9a96b] px-7 py-3.5 text-sm font-semibold text-[#1a1814] shadow-lg shadow-black/30 transition hover:bg-[#d6b87b] sm:text-base"
                >
                  Book a 20-minute interview
                </a>
                <a
                  href="#tell-us"
                  aria-label="Tell us what kind of Palestine trip you would want"
                  className="inline-flex items-center justify-center rounded-full border border-[#f5efe6]/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-[#f5efe6] backdrop-blur transition hover:bg-white/10 sm:text-base"
                >
                  Tell us what kind of Palestine trip you'd want
                </a>
              </div>

              <div className="mt-16 hidden items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#e9e1d3]/60 sm:flex">
                <span className="h-px w-10 bg-[#c9a96b]/60" />
                Scroll to begin
              </div>
            </div>
          </div>
        </section>

        {sections.map((s, i) => (
          <section
            key={i}
            className="relative flex min-h-screen items-center px-5 py-20 sm:px-8 sm:py-28"
          >
            <div className="mx-auto w-full max-w-7xl">
              <div className={s.align === "right" ? "ml-auto max-w-2xl" : "mr-auto max-w-2xl"}>
                <div className="rounded-2xl border border-white/10 bg-black/40 p-7 backdrop-blur-md sm:p-10 md:p-12">
                  <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#c9a96b] sm:text-sm">{s.eyebrow}</p>
                  <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl md:text-5xl">{s.title}</h2>
                  <p className="mt-5 text-base leading-relaxed text-[#e9e1d3]/90 sm:text-lg">{s.body}</p>
                </div>
              </div>
            </div>
          </section>
        ))}

        <section id="talk" className="relative flex min-h-screen items-center px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mx-auto max-w-3xl rounded-2xl border border-[#c9a96b]/30 bg-black/55 p-8 text-center backdrop-blur-md sm:p-12 md:p-16">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#c9a96b] sm:text-sm">Help us build it with you</p>
              <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-[#f5efe6] sm:text-4xl md:text-5xl">
                We are listening first, before we build trips.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#e9e1d3]/90 sm:text-lg">
                We are currently speaking with people who have seriously considered visiting Palestine. Your answers help us build trips that are safe, meaningful, respectful, and real.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <a
                  id="interview"
                  href="#"
                  aria-label="Book a 20-minute interview"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#c9a96b] px-7 py-3.5 text-sm font-semibold text-[#1a1814] shadow-lg shadow-black/30 transition hover:bg-[#d6b87b] sm:w-auto sm:text-base"
                >
                  Book a 20-minute interview
                </a>
                <a
                  id="tell-us"
                  href="#"
                  aria-label="Tell us what kind of Palestine trip you would want"
                  className="inline-flex w-full items-center justify-center rounded-full border border-[#f5efe6]/40 bg-white/5 px-7 py-3.5 text-sm font-semibold text-[#f5efe6] backdrop-blur transition hover:bg-white/10 sm:w-auto sm:text-base"
                >
                  Tell us what kind of Palestine trip you'd want
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/60 px-5 py-8 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-[#e9e1d3]/70 sm:flex-row">
          <span><span className="text-[#c9a96b]">Tour</span>Minded</span>
          <span>Travel as a human, not a tourist.</span>
        </div>
      </footer>
    </div>
  );
}
