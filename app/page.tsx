"use client";

import dynamic from "next/dynamic";
import { ModeProvider, useMode } from "@/lib/mode";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import { Cursor, LapCounter, ScrollTrack, Speedo } from "@/components/Chrome";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Driver from "@/components/Driver";
import Garage from "@/components/Garage";
import Laps from "@/components/Laps";
import Showroom from "@/components/Showroom";
import Podium from "@/components/Podium";
import Radio from "@/components/Radio";

const Scene = dynamic(() => import("@/components/three/Scene"), { ssr: false });

// the 3D circuit only runs in race mode; recruiter mode stays light
function World3D() {
  const { mode } = useMode();
  return mode === "race" ? <Scene /> : null;
}

export default function Home() {
  return (
    <ModeProvider>
      <World3D />
      <Loader />
      <ScrollTrack />
      <LapCounter />
      <Speedo />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Driver />
        <Garage />
        <Laps />
        <Showroom />
        <Podium />
        <Radio />
      </main>
    </ModeProvider>
  );
}
