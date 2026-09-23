import React, { useEffect, useState } from "react";
import {
  Button,
  LinearProgress,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Tooltip,
  CircularProgress,
  Grid,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { uploadInvoice, getInvoice, getInvoices } from "../services/api";
import type { InvoiceSummary } from "../services/api";
import { useJobPoll } from "../hooks/useJobPoll";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [invoiceDetail, setInvoiceDetail] = useState<any | null>(null);
  const [invoiceList, setInvoiceList] = useState<InvoiceSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  useJobPoll(jobId, {
    intervalMs: 2000,
    onUpdate: (job) => setJobStatus(job.status),
    onComplete: async (job) => {
      setJobStatus(job.status);
      if (job.invoiceId) {
        try {
          const inv = await getInvoice(job.invoiceId);
          setInvoiceDetail(inv);
        } catch {
          setError("Error retrieving invoice details");
        }
      }
      setUploading(false);
      void loadInvoices();
    },
    onError: (err) => {
      console.error(err);
      setError("Error polling job");
      setUploading(false);
    },
  });

  useEffect(() => {
    void loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      setLoadingInvoices(true);
      const res = await getInvoices(1, 50);
      setInvoiceList(res.items ?? []);
    } catch (e) {
      console.error(e);
      setError("Unable to load the invoice list");
    } finally {
      setLoadingInvoices(false);
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Select a file");
      return;
    }

    setError(null);
    setInvoiceDetail(null);
    setJobStatus("Pending");
    setJobId(null);
    setUploadPct(0);

    setUploading(true);
    try {
      const res = await uploadInvoice(file, (pct) => setUploadPct(pct));
      setJobId(res.jobId);
    } catch (e) {
      console.error(e);
      setError("Upload failed");
      setUploading(false);
    }
  };

  async function showInvoiceDetail(id: string) {
    try {
      setLoadingDetailId(id);
      setError(null);
      const inv = await getInvoice(id);
      setInvoiceDetail(inv);
    } catch (e) {
      console.error(e);
      setError("Unable to load invoice details");
    } finally {
      setLoadingDetailId(null);
    }
  }

  // wrapper common width for top and bottom panels
  const panelProps = { sx: { width: "100%", maxWidth: 1000, margin: "0 auto", p: 2 } };

  return (
    <Box className="app-container">
      <div className="header" style={{ marginBottom: 12 }}>
        <Typography variant="h5">Invoice Analyzer</Typography>
        <Typography variant="caption" className="kv">
          Invoice upload, analysis and management demo
        </Typography>
      </div>

      <Grid container spacing={2} justifyContent="center">
        {/* Upload Panel centered and same width as table */}
        <Grid item xs={12}>
          <Paper className="card" elevation={2} {...panelProps}>
            <Box
              className="upload-row"
              sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: 2 }}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFile}
                disabled={uploading}
                style={{ display: "block" }}
              />

              <Button variant="contained" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Loading..." : "Upload invoice"}
              </Button>

              <Tooltip title="Refresh invoice list">
                <span>
                  <IconButton onClick={() => void loadInvoices()} disabled={loadingInvoices}>
                    {loadingInvoices ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </span>
              </Tooltip>

              <Box sx={{ ml: "auto", textAlign: "right", minWidth: 180 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Job status
                </Typography>
                <Typography variant="caption">Id: {jobId ?? "—"}</Typography>
                <Typography variant="caption" display="block">
                  Status:{" "}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color:
                        jobStatus === "Completed"
                          ? "var(--success)"
                          : jobStatus === "Failed"
                          ? "var(--danger)"
                          : "var(--primary)",
                    }}
                  >
                    {jobStatus ?? "—"}
                  </Box>
                </Typography>
              </Box>
            </Box>

            <Box className="job-box" sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={uploadPct}
                sx={{
                  height: 10,
                  borderRadius: 6,
                  "& .MuiLinearProgress-bar": { backgroundColor: "var(--accent)" },
                  backgroundColor: "#e6eefc",
                }}
              />
              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                Upload progress: {uploadPct}%
              </Typography>

              {invoiceDetail && (
                <Box sx={{ mt: 2, p: 1, borderRadius: 1 }}>
                  <Typography variant="subtitle2">Last selected invoice</Typography>
                  <pre style={{ whiteSpace: "pre-wrap", maxHeight: 180, overflow: "auto" }}>
                    {JSON.stringify(invoiceDetail, null, 2)}
                  </pre>
                </Box>
              )}

              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Invoice List Panel (same max width) */}
        <Grid item xs={12}>
          <Paper className="card table-wrapper" elevation={1} {...panelProps}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="h6">Invoices (DB)</Typography>
              <Typography variant="caption" className="kv">
                Total: {invoiceList.length}
              </Typography>
            </Box>

            <Table className="table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">VAT</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Loaded</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      {loadingInvoices ? "Loading..." : "No invoices found"}
                    </TableCell>
                  </TableRow>
                )}
                {invoiceList.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>{inv.invoiceNumber ?? "—"}</TableCell>
                    <TableCell>{inv.vendorName ?? "—"}</TableCell>
                    <TableCell align="right">{inv.totalAmount ?? "—"}</TableCell>
                    <TableCell align="right">{inv.taxAmount ?? "—"}</TableCell>
                    <TableCell>{inv.suggestedCategory ?? "—"}</TableCell>
                    <TableCell>{inv.status ?? "—"}</TableCell>
                    <TableCell>{inv.uploadedAt ? new Date(inv.uploadedAt).toLocaleString() : "—"}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View details">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => void showInvoiceDetail(inv.id)}
                            disabled={loadingDetailId !== null}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}