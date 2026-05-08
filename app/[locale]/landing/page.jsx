"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 282;
const FRAME_PATH = (i) =>
  `/frames/palestine/frame-${String(i).padStart(3, "0")}.jpg`;
const MOBILE_VIDEO = "/videos/palestine-video-mobile.mp4";
const MOBILE_BREAKPOINT = "(max-width: 768px)";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const sections = [
  {
    eyebrow: "Meet the people",
    title: "Meet the people and hear their stories",
    body: "Share meals, conversations, and everyday moments with locals, families, artists, organizers, and people whose lives are usually spoken about, but rarely listened to. You'll hear personal stories from people living the reality every day.",
    align: "left",
  },
  
  {
    eyebrow: "See clearly",
    title: "Understand the reality",
    body: "See the difference between Palestinian neighborhoods, settlements, checkpoints, walls, and roads. Understand the reality with local guides who explain what you are seeing with care, context, and honesty.",
    align: "right",
  },
 
  {
    eyebrow: "Travel with intention",
    title: "Know where your money goes",
    body: "We prioritize Palestinian guides, drivers, hosts, restaurants, guesthouses, artists, and community partners, so your trip supports local people directly.",
    align: "left",
  },
   {
    eyebrow: "Taste the land",
    title: "Eat the food",
    body: "Taste Palestine through home-cooked meals, local restaurants, markets, bakeries, coffee, and knafeh.",
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
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  const framesRef = useRef([]);
  const loadedCountRef = useRef(0);
  const currentFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const tickingRef = useRef(false);

  const [mode, setMode] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT);
    setMode(mq.matches ? "mobile" : "desktop");
  }, []);

  useEffect(() => {
    if (mode !== "mobile") return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if (v.readyState >= 2) tryPlay();
    else v.addEventListener("loadeddata", tryPlay, { once: true });
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, [mode]);

  useEffect(() => {
    if (mode !== "desktop") return;
    let cancelled = false;
    const frames = new Array(FRAME_COUNT);
    framesRef.current = frames;
    loadedCountRef.current = 0;
    setLoadProgress(0);

    const READY_THRESHOLD = Math.min(
      FRAME_COUNT,
      Math.ceil(FRAME_COUNT * 0.05)
    );

    const loadOne = (i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = FRAME_PATH(i + 1);
      frames[i] = img;
      const done = () => {
        if (cancelled) return;
        loadedCountRef.current += 1;
        setLoadProgress(loadedCountRef.current / FRAME_COUNT);
      };
      return img
        .decode()
        .then(done)
        .catch(
          () =>
            new Promise((res) => {
              img.onload = () => {
                done();
                res();
              };
              img.onerror = () => {
                done();
                res();
              };
            })
        );
    };

    (async () => {
      for (let i = 0; i < READY_THRESHOLD; i++) {
        if (cancelled) return;
        await loadOne(i);
        if (i === 0) drawFrame(0, true);
      }
      if (cancelled) return;
      setReady(true);
      for (let i = READY_THRESHOLD; i < FRAME_COUNT; i++) {
        if (cancelled) return;
        loadOne(i);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  useEffect(() => {
    if (mode !== "desktop") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const idx = currentFrameRef.current;
      currentFrameRef.current = -1;
      drawFrame(idx >= 0 ? idx : 0, true);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
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
  }, [mode]);

  useEffect(() => {
    if (mode !== "desktop") return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const update = () => {
      tickingRef.current = false;
      const scrollStart = wrapper.offsetTop;
      const scrollEnd =
        wrapper.offsetTop + wrapper.offsetHeight - window.innerHeight;
      const range = Math.max(scrollEnd - scrollStart, 1);
      const progress = clamp((window.scrollY - scrollStart) / range, 0, 1);
      const target = Math.round(progress * (FRAME_COUNT - 1));
      drawFrame(target);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [mode]);

  function drawFrame(index, force = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!force && index === currentFrameRef.current) return;

    const img = framesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const canvasAspect = cw / ch;
    const imgAspect = iw / ih;

    let dw, dh, dx, dy;
    if (imgAspect > canvasAspect) {
      dh = ch;
      dw = dh * imgAspect;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      dw = cw;
      dh = dw / imgAspect;
      dx = 0;
      dy = (ch - dh) / 2;
    }

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
    currentFrameRef.current = index;
  }

  return (
    <div className="relative min-h-screen w-full bg-[#1a1814] text-[#f5efe6] antialiased">
      <div className="pointer-events-none fixed inset-0 z-0">
        {mode === "desktop" && (
          <canvas ref={canvasRef} className="block h-full w-full" />
        )}
        {mode === "mobile" && (
          <video
            ref={videoRef}
            src={MOBILE_VIDEO}
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

      {mode === "desktop" && !ready && (
        <div className="fixed inset-0 z-40 flex items-end justify-center px-6 pb-10 pointer-events-none">
          <div className="w-full max-w-sm">
            <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.3em] text-[#e9e1d3]/70">
              <span>Loading</span>
              <span>{Math.round(loadProgress * 100)}%</span>
            </div>
            <div className="h-px w-full bg-[#f5efe6]/15">
              <div
                className="h-full bg-[#c9a96b] transition-[width] duration-200"
                style={{ width: `${loadProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
          <a
            href="#top"
            className="text-xl font-semibold tracking-wide text-[#f5efe6] sm:text-2xl"
          >
            <span className="text-[#c9a96b]">Watermelon</span>Tours
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {/* <a href="#about" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">About</a>
            <a href="#trips" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">Trips</a>
            <a href="#why" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">Why Palestine</a>
            <a href="#faq" className="text-sm font-medium text-[#e9e1d3]/85 transition hover:text-[#f5efe6]">FAQ</a> */}
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

      <main id="top" ref={wrapperRef} className="relative z-10">
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
              <div
                className={
                  s.align === "right" ? "ml-auto max-w-2xl" : "mr-auto max-w-2xl"
                }
              >
                <article
                  data-reveal
                  className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-black/45 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl translate-y-8 opacity-0 transition-all duration-[900ms] ease-out data-[revealed=true]:translate-y-0 data-[revealed=true]:opacity-100 sm:p-10 md:p-12"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96b]/70 to-transparent"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-inset ring-white/5"
                  />

                  <div className="mb-7 flex items-center gap-4">
                    <span className="font-serif text-2xl font-semibold leading-none text-[#c9a96b] sm:text-3xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-gradient-to-r from-[#c9a96b]/60 via-[#c9a96b]/20 to-transparent"
                    />
                    <span className="text-[10px] uppercase tracking-[0.32em] text-[#c9a96b]/85 sm:text-xs">
                      {s.eyebrow}
                    </span>
                  </div>

                  <h2 className="font-serif text-[28px] font-semibold leading-[1.08] tracking-tight text-[#f5efe6] sm:text-4xl md:text-[44px]">
                    {s.title}
                  </h2>

                  <p className="mt-6 max-w-[58ch] text-[15px] leading-[1.65] text-[#e9e1d3]/85 sm:text-base md:text-lg">
                    {s.body}
                  </p>

                  <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-[#e9e1d3]/45">
                    <span>Chapter {String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-[#e9e1d3]/30" />
                    <span>of {String(sections.length).padStart(2, "0")}</span>
                  </div>
                </article>
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
          <span><span className="text-[#c9a96b]">Watermelon</span>Tours</span>
          <span>Travel as a human, not a tourist.</span>
        </div>
      </footer>
    </div>
  );
}
