"use client";

import { createContext, useContext, useRef, type MutableRefObject, type ReactNode } from "react";

export type HomeScrollState = {
  hero: number;
  section: number;
  workers: number;
  global: number;
};

const defaultState: HomeScrollState = {
  hero: 0,
  section: 0,
  workers: 0,
  global: 0,
};

const HomeScrollContext = createContext<MutableRefObject<HomeScrollState> | null>(null);

export function HomeScrollProvider({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HomeScrollState>({ ...defaultState });
  return <HomeScrollContext.Provider value={scrollRef}>{children}</HomeScrollContext.Provider>;
}

export function useHomeScrollRef() {
  return useContext(HomeScrollContext);
}

export function useHomeScrollState() {
  const ref = useHomeScrollRef();
  return ref?.current ?? defaultState;
}
