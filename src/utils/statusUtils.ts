export const JOB_STATUS_DESCRIPTIONS: Record<number, string> = {
    0: "Pending",
    1: "Processing",
    2: "Completed",
    3: "Failed",
};


export function getStatusDescription(status: number): string {
  return JOB_STATUS_DESCRIPTIONS[status] ?? `Stato sconosciuto (${status})`;
}