import { useState, useEffect, useRef } from 'react';

export default function CountdownTimer({ startTime, endTime, serverTime }) {
  const [timerState, setTimerState] = useState({
    state: 'loading', // 'not_started', 'active', 'ended'
    message: '',
    timeLeft: {}
  });
  const offsetRef = useRef(0);

  const formatNumber = (n) => (n < 10 ? `0${n}` : n);

  function calculateTimerState() {
    if (!startTime || !endTime || !serverTime) {
      return { state: 'loading', message: 'Loading...', timeLeft: {} };
    }

    // Parse MySQL datetime to Date object (PH time)
    const parseMySQLDate = (mysqlDateTime) => {
      if (!mysqlDateTime) return null;
      if (mysqlDateTime.includes(' ')) {
        const [datePart, timePart] = mysqlDateTime.split(' ');
        const [year, month, day] = datePart.split('-');
        const [hour, minute, second] = timePart.split(':');
        return new Date(Date.UTC(year, month - 1, day, hour - 8, minute, second));
      }
      return new Date(mysqlDateTime);
    };

    const start = parseMySQLDate(startTime);
    const end = parseMySQLDate(endTime);
    
    // Parse server time
    let serverNow;
    if (serverTime.includes(' ')) {
      const [datePart, timePart] = serverTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      serverNow = Date.UTC(year, month - 1, day, hour - 8, minute, second);
    } else {
      serverNow = new Date(serverTime).getTime();
    }

    const clientNow = Date.now();
    const adjustedNow = clientNow - offsetRef.current;

    // Check state
    if (adjustedNow < start.getTime()) {
      // NOT STARTED YET
      const difference = start.getTime() - adjustedNow;
      return {
        state: 'not_started',
        message: 'Starts in',
        timeLeft: {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      };
    } 
    else if (adjustedNow >= start.getTime() && adjustedNow <= end.getTime()) {
      // ACTIVE ELECTION
      const difference = end.getTime() - adjustedNow;
      return {
        state: 'active',
        message: 'Ends in',
        timeLeft: {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        }
      };
    } 
    else {
      // ELECTION ENDED
      return {
        state: 'ended',
        message: 'Election Ended',
        timeLeft: {}
      };
    }
  }

  useEffect(() => {
    if (!startTime || !endTime || !serverTime) return;

    // Compute offset once on mount
    const clientNow = Date.now();
    let serverNow;
    if (serverTime.includes(' ')) {
      const [datePart, timePart] = serverTime.split(' ');
      const [year, month, day] = datePart.split('-');
      const [hour, minute, second] = timePart.split(':');
      serverNow = Date.UTC(year, month - 1, day, hour - 8, minute, second);
    } else {
      serverNow = new Date(serverTime).getTime();
    }
    offsetRef.current = clientNow - serverNow;

    setTimerState(calculateTimerState());

    const timer = setInterval(() => {
      setTimerState(calculateTimerState());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, serverTime]);

  // Loading state
  if (timerState.state === 'loading') {
    return <div className="text-gray-500">Loading timer...</div>;
  }

  // Ended state
  if (timerState.state === 'ended') {
    return (
      <div className="flex items-center gap-2 bg-red-100 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-red-300">
        <span className="text-red-600 font-bold text-sm sm:text-base">⏰</span>
        <span className="text-red-700 font-semibold text-sm sm:text-base">{timerState.message}</span>
      </div>
    );
  }

  // Not started or active - show countdown
  const { days, hours, minutes, seconds } = timerState.timeLeft;
  const hasDays = days > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white/30 backdrop-blur-md rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-white/50">
      <span className="text-[#0f4c5c] font-medium text-sm sm:text-base">{timerState.message}:</span>
      <div className="flex gap-1 sm:gap-2">
        {hasDays && (
          <>
            <div className="flex items-center gap-1">
              <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg">
                <span className="relative z-10">{formatNumber(days || 0)}</span>
              </span>
              <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">d</span>
            </div>
            <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
          </>
        )}
        
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg">
            <span className="relative z-10">{formatNumber(hours || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">h</span>
        </div>
        
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg">
            <span className="relative z-10">{formatNumber(minutes || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">m</span>
        </div>
        
        <span className="text-[#0f4c5c] text-lg sm:text-xl font-bold self-center">:</span>
        
        <div className="flex items-center gap-1">
          <span className="relative bg-[#0f4c5c] text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-base sm:text-xl font-bold tabular-nums shadow-lg">
            <span className="relative z-10">{formatNumber(seconds || 0)}</span>
          </span>
          <span className="text-[#5a6b7a] text-xs sm:text-sm font-medium">s</span>
        </div>
      </div>
    </div>
  );
}