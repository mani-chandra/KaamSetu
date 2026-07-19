"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHomeScrollRef } from "@/lib/scroll/home-scroll-context";
import {
  cityScrollStore,
  resetCityScrollSmoothing,
  snapCityScrollProgress,
  tickCityScrollSmoothing,
} from "@/lib/scroll/city-scroll-store";
import { computeCinematicProgress } from "@/lib/scroll/cinematic-progress";

gsap.registerPlugin(ScrollTrigger);

export function useHomeScroll(containerRef: React.RefObject<HTMLElement | null>) {
  const scrollRef = useHomeScrollRef();

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !scrollRef) return;

    let raf = 0;
    let lastFrame = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;

      const raw = computeCinematicProgress();
      const smoothed = tickCityScrollSmoothing(raw, dt);

      scrollRef.current.global = smoothed;
      scrollRef.current.hero = Math.min(1, smoothed / 0.26);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      const raw = computeCinematicProgress();
      snapCityScrollProgress(raw);
      scrollRef.current.global = cityScrollStore.global;
      scrollRef.current.hero = cityScrollStore.hero;
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize, { passive: true });

    const search = root.querySelector<HTMLElement>("#home-hero-search");
    let searchTimeline: gsap.core.Timeline | null = null;
    if (search) {
      searchTimeline = gsap
        .timeline({
          scrollTrigger: {
            trigger: "#cinematic-scroll",
            start: "70% top",
            end: "88% top",
            scrub: 1.4,
          },
        })
        .fromTo(search, { opacity: 0, y: 48, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ease: "power2.out" }, 0);
    }

    root.querySelectorAll<HTMLElement>("[data-scroll-reveal]").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
        }
      );
    });

    root.querySelectorAll<HTMLElement>("[data-scroll-card]").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 36, opacity: 0, rotateY: -4 },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.65,
          delay: (i % 4) * 0.06,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
        }
      );
    });

    const refresh = () => ScrollTrigger.refresh();
    refresh();
    const refreshTimer = window.setTimeout(refresh, 250);
    const refreshTimer2 = window.setTimeout(refresh, 1000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(refreshTimer);
      window.clearTimeout(refreshTimer2);
      window.removeEventListener("resize", onResize);
      searchTimeline?.scrollTrigger?.kill();
      searchTimeline?.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger && root.contains(t.trigger as Node)) t.kill();
      });
      resetCityScrollSmoothing();
    };
  }, [containerRef, scrollRef]);
}
