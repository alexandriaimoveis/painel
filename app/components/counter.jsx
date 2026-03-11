"use client";

import { useEffect, useState } from "react";

export default function Counter() {
    const launchDate = new Date("2026-03-11T20:00:00");

  const calculateTimeLeft = () => {
    const difference = launchDate - new Date();
    const totalSeconds = Math.max(0, Math.floor(difference / 1000));

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return { hours, minutes, seconds, totalSeconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-center gap-4">
      <div className="bg-white text-black rounded-xl p-4 md:p-6 shadow-lg">
        <div className="text-4xl md:text-6xl font-bold">{timeLeft.hours}</div>
        <div className="text-sm md:text-base">Horas</div>
      </div>
      <div className="bg-white text-black rounded-xl p-4 md:p-6 shadow-lg">
        <div className="text-4xl md:text-6xl font-bold">{timeLeft.minutes}</div>
        <div className="text-sm md:text-base">Minutos</div>
      </div>
      <div className="bg-white text-black rounded-xl p-4 md:p-6 shadow-lg">
        <div className="text-4xl md:text-6xl font-bold">{timeLeft.seconds}</div>
        <div className="text-sm md:text-base">Segundos</div>
      </div>
    </div>
  );
}