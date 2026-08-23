import { useEffect, useState } from "react";

const CLOCK_UPDATE_INTERVAL_MS = 1_000;

export function useCurrentDateTime(): Date {
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, CLOCK_UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return currentDateTime;
}
