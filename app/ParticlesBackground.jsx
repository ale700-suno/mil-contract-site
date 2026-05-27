"use client";

import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useCallback } from "react";

export default function ParticlesBackground() {
  const init = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <>
      {/* 🌫️ FOG / SMOKE LAYERS */}
      <div className="fixed inset-0 -z-30 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_60%)] blur-3xl opacity-60 animate-pulse" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_70%)] opacity-70" />

      {/* 🎯 PARTICLES */}
      <Particles
        className="fixed inset-0 -z-10"
        init={init}
        options={{
          fullScreen: false,

          background: {
            color: "transparent",
          },

          fpsLimit: 60,

          particles: {
            number: {
              value: 75,
              density: {
                enable: true,
                area: 900,
              },
            },

            color: {
              value: "#ffffff",
            },

            shape: {
              type: "circle",
            },

            opacity: {
              value: 0.2,
            },

            size: {
              value: { min: 1, max: 3 },
            },

            links: {
              enable: true,
              color: "#ffffff",
              distance: 160,
              opacity: 0.12,
              width: 1,
            },

            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              outModes: {
                default: "out",
              },
            },
          },

          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 120,
                duration: 0.4,
              },
            },
          },

          detectRetina: true,
        }}
      />
    </>
  );
}