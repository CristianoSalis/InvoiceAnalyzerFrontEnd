import axios from "axios";

const apiBase = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5000";

const http = axios.create({
  baseURL: apiBase,
  headers: { Accept: "application/json" },
});

export type JobStatus = "Pending" | "Running" | "Completed" | "Failed";

export interface JobResponse {
  id: string;
  invoiceId: string;
  status: JobStatus;
  progress: number;
  resultLog?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber?: string | null;
  vendorName?: string | null;
  totalAmount?: number | null;
  taxAmount?: number | null;
  suggestedCategory?: string | null;
  status?: string | null;
  uploadedAt?: string | null;
  processedAt?: string | null;
}

export interface InvoiceListResponse {
  total: number;
  page: number;
  pageSize: number;
  items: InvoiceSummary[];
}

export async function uploadInvoice(
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<{ invoiceId: string; jobId: string }> {
  const fd = new FormData();
  fd.append("file", file, file.name);

  const res = await http.post("/api/invoices/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (ev) => {
      if (ev.total) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        onUploadProgress?.(pct);
      }
    },
  });
  return res.data;
}

export async function getJob(jobId: string): Promise<JobResponse> {
  const res = await http.get<JobResponse>(`/api/invoices/jobs/${jobId}`);
  return res.data;
}

export async function getInvoice(invoiceId: string): Promise<any> {
  const res = await http.get(`/api/invoices/${invoiceId}`);
  return res.data;
}

export async function getInvoices(page = 1, pageSize = 50, vendor?: string, status?: string): Promise<InvoiceListResponse> {
  const res = await http.get<InvoiceListResponse>("/api/invoices", {
    params: { page, pageSize, vendor, status },
  });
  return res.data;
}