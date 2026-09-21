import { useEffect, useMemo, useState } from 'react';

function diffParts(targetMs, nowMs) {
  const totalSeconds = Math.max(Math.floor((targetMs - nowMs) / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * Ticks every second toward `targetDate`. `serverTimeOffsetMs` (server
 * time - device time, captured once when data loads) keeps the countdown
 * accurate even if the user's device clock is wrong, since the actual
 * open/close decision is always made server-side anyway - this is purely
 * a UI affordance.
 */
export function useCountdown(targetDate, serverTimeOffsetMs = 0) {
  const targetMs = targetDate ? new Date(targetDate).getTime() : null;
  const [nowMs, setNowMs] = useState(() => Date.now() + serverTimeOffsetMs);

  useEffect(() => {
    if (!targetMs) return undefined;
    const id = setInterval(() => setNowMs(Date.now() + serverTimeOffsetMs), 1000);
    return () => clearInterval(id);
  }, [targetMs, serverTimeOffsetMs]);

  return useMemo(() => {
    if (!targetMs) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
    const parts = diffParts(targetMs, nowMs);
    return { ...parts, isExpired: parts.totalSeconds <= 0 };
  }, [targetMs, nowMs]);
}
