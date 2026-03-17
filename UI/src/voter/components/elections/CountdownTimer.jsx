import { useState, useEffect } from 'react';

export default function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endTime) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { expired: true };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatNumber = (num) => (num < 10 ? `0${num}` : num);

  if (timeLeft.expired) {
    return (
      <div className="bg-red-500/80 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-white font-semibold shadow-lg border border-white/30 animate-pulse text-sm sm:text-base">
        ⏳ Election Ended
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/30 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-white/50">
      <span className="text-[#0f4c5c] font-medium text-sm sm:text-base">Ends in:</span>
      <div className="flex gap-1 sm:gap-2">
        {/* Minutes */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.minutes || 0)}</span>
            <span className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-flip-sheet"></span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">m</span>
        </div>
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        {/* Seconds */}
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg overflow-hidden">
            <span className="relative z-10">{formatNumber(timeLeft.seconds || 0)}</span>
            <span className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-flip-sheet"></span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">s</span>
        </div>
      </div>
    </div>
  );
}