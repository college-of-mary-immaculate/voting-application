import { useState, useEffect, useRef } from 'react';

export default function CountdownTimer({ endTime, serverTime }) {
  const [timeLeft, setTimeLeft] = useState({});
  const offsetRef = useRef(0); // difference between client and server

  const formatNumber = (n) => (n < 10 ? `0${n}` : n);

  function calculateTimeLeft() {
    if (!endTime || !serverTime) return {};

    const end = new Date(endTime);          // backend UTC
    const clientNow = Date.now();           // current browser time
    const serverNow = new Date(serverTime).getTime();

    // Adjusted current time
    const adjustedNow = clientNow - offsetRef.current;

    const difference = end - adjustedNow;

    if (difference <= 0) return { expired: true };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    if (!endTime || !serverTime) return;

    // Compute offset once on mount
    const clientNow = Date.now();
    const serverNow = new Date(serverTime).getTime();
    offsetRef.current = clientNow - serverNow;

    setTimeLeft(calculateTimeLeft()); // initialize

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, serverTime]);

  if (timeLeft.expired) {
    return <div className="text-red-500 font-bold">⏳ Election Ended</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/30 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-white/50">
      <span className="text-[#0f4c5c] font-medium text-sm sm:text-base">Ends in:</span>
      <div className="flex gap-1 sm:gap-2">
        {/* Days */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.days || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">d</span>
        </div>
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        {/* Hours */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.hours || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">h</span>
        </div>
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        {/* Minutes */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.minutes || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">m</span>
        </div>
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        {/* Seconds */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.seconds || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">s</span>
        </div>
      </div>
    </div>
  );
}