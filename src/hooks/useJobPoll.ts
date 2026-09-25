import { useEffect, useRef } from "react";
import { getJob } from "../services/api";
import type { JobResponse } from "../services/api";

type Options = {
  intervalMs?: number;
  maxIntervalMs?: number;
  onUpdate?: (job: JobResponse) => void;
  onComplete?: (job: JobResponse) => void;
  onError?: (err: unknown) => void;
};

export function useJobPoll(jobId: string | null, options?: Options) {
  const stopped = useRef(false);
  
  // Mantiene sempre aggiornate le opzioni senza riattivare lo useEffect
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!jobId) return;
    stopped.current = false;

    const intervalBase = optionsRef.current?.intervalMs ?? 2000;
    const maxInterval = optionsRef.current?.maxIntervalMs ?? 30000;

    let attempt = 0;

    async function loop() {
      while (!stopped.current) {
        try {
          const job = await getJob(jobId!);
          optionsRef.current?.onUpdate?.(job);

          if (Number(job.status) === 2 || Number(job.status) === 3) {
            console.log("async function loop - job.status: ", job.status);
            optionsRef.current?.onComplete?.(job);
            stopped.current = true;
            break;
          }

          attempt++;
          const delay = Math.min(intervalBase * Math.pow(1.5, attempt), maxInterval);
          await new Promise((r) => setTimeout(r, delay));
        } catch (err) {
          optionsRef.current?.onError?.(err);
          await new Promise((r) => 
            setTimeout(r, Math.min(intervalBase * Math.pow(1.5, attempt + 1), maxInterval))
          );
          attempt++;
        }
      }
    }

    loop();

    return () => {
      stopped.current = true;
    };
  }, [jobId]);
}