import { useEffect, useRef } from "react";
import { getJob } from "../services/api";
import type { JobResponse } from "../services/api";

type Options = {
  intervalMs?: number; // base interval
  maxIntervalMs?: number;
  onUpdate?: (job: JobResponse) => void;
  onComplete?: (job: JobResponse) => void;
  onError?: (err: unknown) => void;
};

export function useJobPoll(jobId: string | null, options?: Options) {
  const stopped = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    stopped.current = false;

    const intervalBase = options?.intervalMs ?? 2000;
    const maxInterval = options?.maxIntervalMs ?? 30000;

    let attempt = 0;

    async function loop() {
      while (!stopped.current) {
        try {
          const job = await getJob(jobId);
          options?.onUpdate?.(job);

          if (job.status === "Completed" || job.status === "Failed") {
            options?.onComplete?.(job);
            break;
          }

          attempt++;
          const delay = Math.min(intervalBase * Math.pow(1.5, attempt), maxInterval);
          await new Promise((r) => setTimeout(r, delay));
        } catch (err) {
          options?.onError?.(err);
          // wait a bit and retry (do not break immediately)
          await new Promise((r) => setTimeout(r, Math.min(intervalBase * Math.pow(1.5, attempt + 1), maxInterval)));
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