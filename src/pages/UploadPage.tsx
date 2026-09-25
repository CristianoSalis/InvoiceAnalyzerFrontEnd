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
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { uploadInvoice, getInvoice, getInvoices } from "../services/api";
import type { InvoiceSummary } from "../services/api";
import { useJobPoll } from "../hooks/useJobPoll";
import { getStatusDescription } from "../utils/statusUtils";

const normalizeJobStatus = (status: string | number) => {
  const statuses = ["Pending", "Running", "Completed", "Failed"];

  if (typeof status === "number") {
    return statuses[status] ?? "Unknown";
  }

  return status;
};


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
    onUpdate: (job) => {
      console.log("Refresh-useJobPoll-Job Update:", job.status);
      setJobStatus(job.status);
    },
    onComplete: async (job) => {
      console.log("useJobPoll-Job Complete:", job);
      setJobStatus(job.status);
      if (job.invoiceId) {
        try {
          const inv = await getInvoice(job.invoiceId);
          setInvoiceDetail(inv);
        } catch {
          console.error("useJobPoll-Error retrieving invoice");
          setError("Error retrieving invoice details");
        }
      }
      console.log("useJobPoll-Stopping upload animation");
      setUploading(false);
      setFile(null);      
      setUploadPct(0);      
      void loadInvoices();
    },
    onError: (err) => {
      console.error("useJobPoll-Job Poll Error:", err);
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "Completed":
        return <CheckCircleIcon sx={{ fontSize: 20, color: "#10b981" }} />;
      case "Failed":
        return <ErrorIcon sx={{ fontSize: 20, color: "#ef4444" }} />;
      case "Pending":
      case "Processing":
        return <HourglassEmptyIcon sx={{ fontSize: 20, color: "#f59e0b" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Completed":
        return "#d1fae5";
      case "Failed":
        return "#fee2e2";
      case "Pending":
      case "Processing":
        return "#fef3c7";
      default:
        return "#f3f4f6";
    }
  };

  const panelProps = { 
    sx: { 
      width: "100%", 
      maxWidth: 1200, 
      margin: "0 auto",
    } 
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Box {...panelProps}>
        {/* Header */}
        <Box sx={{ mb: 4, pl: 2, pr: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "white",
              mb: 1,
              textShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            Invoice Analyzer
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 300,
            }}
          >
            Upload, analyze and manage your invoices.
          </Typography>
        </Box>

        {/* Upload Panel */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: "white",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CloudUploadIcon sx={{ fontSize: 28, color: "#667eea", mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#1f2937" }}>
              Upload Invoice
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                flex: 1,
                position: "relative",
                border: "2px dashed #667eea",
                borderRadius: 1.5,
                p: 2,
                textAlign: "center",
                backgroundColor: "#f3f4f6",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#ede9fe",
                  borderColor: "#764ba2",
                },
              }}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFile}
                disabled={uploading}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  left: 0,
                  top: 0,
                  cursor: "pointer",
                  opacity: 0,
                }}
              />
              <Box sx={{ pointerEvents: "none" }}>
                <CloudUploadIcon
                  sx={{
                    fontSize: 32,
                    color: "#667eea",
                    mb: 1,
                    display: "block",
                    margin: "0 auto 0.5rem",
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}>
                  {file ? file.name : "Click to upload or drag and drop"}
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  PDF or image files accepted
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!file || uploading}
              sx={{
                px: 3,
                py: 1.5,
                minWidth: 150,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                },
                "&:disabled": {
                  background: "#d1d5db",
                  boxShadow: "none",
                },
              }}
            >
              {uploading ? (
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
              ) : (
                <CloudUploadIcon sx={{ mr: 1 }} />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </Button>

            <Tooltip title="Refresh invoice list">
              <span>
                <IconButton
                  onClick={() => void loadInvoices()}
                  disabled={loadingInvoices}
                  sx={{
                    border: "2px solid #e5e7eb",
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                      borderColor: "#667eea",
                    },
                  }}
                >
                  {loadingInvoices ? (
                    <CircularProgress size={24} />
                  ) : (
                    <RefreshIcon sx={{ color: "#667eea" }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

        {/* Progress Section */}
          {uploading && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                  Upload Progress
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: "#667eea" }}>
                  {uploadPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={uploadPct}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#e5e7eb",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  },
                }}
              />
            </Box>
          )}

          {/* Job Status Card */}
          {jobId && jobStatus && (
            <Card
              sx={{
                background: getStatusColor(jobStatus),
                border: "1px solid #e5e7eb",
                mb: 3,
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {getStatusIcon(jobStatus)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                      Job Status
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          ID
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937", fontFamily: "monospace" }}>
                          {jobId}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          Status
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#1f2937" }}>
                          {normalizeJobStatus(jobStatus) ?? "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}


          {/* Invoice Detail */}
          {invoiceDetail && (
            <Card
              sx={{
                background: "#ecfdf5",
                border: "1px solid #86efac",
                mb: 3,
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                  <CheckCircleIcon sx={{ color: "#10b981" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                    Invoice Details
                  </Typography>
                </Box>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    maxHeight: 200,
                    overflow: "auto",
                    backgroundColor: "rgba(255,255,255,0.5)",
                    padding: "12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontFamily: "Fira Code, monospace",
                    color: "#1f2937",
                  }}
                >
                  {JSON.stringify(invoiceDetail, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 1.5,
                mb: 2,
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                "& .MuiAlert-icon": {
                  color: "#dc2626",
                },
              }}
            >
              {error}
            </Alert>
          )}
        </Paper>

        {/* Invoice List Panel */}
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
              Invoices Database
            </Typography>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                backdropFilter: "blur(10px)",
              }}
            >
              <Typography variant="body2" sx={{ color: "white", fontWeight: 600 }}>
                Total: {invoiceList.length}
              </Typography>
            </Box>
          </Box>

          {loadingInvoices ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, color: "#6b7280" }}>Loading invoices...</Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f9fafb",
                      "& th": {
                        fontWeight: 700,
                        color: "#1f2937",
                        borderBottom: "2px solid #e5e7eb",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.5px",
                      },
                    }}
                  >
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" sx={{ color: "#9ca3af" }}>
                          No invoices yet. Upload one to get started!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoiceList.map((inv, idx) => (
                      <TableRow
                        key={inv.id}
                        sx={{
                          backgroundColor: idx % 2 === 0 ? "white" : "#f9fafb",
                          borderBottom: "1px solid #e5e7eb",
                          transition: "backgroundColor 0.2s ease",
                          "&:hover": {
                            backgroundColor: "#f3f4f6",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 600,
                              color: "#667eea",
                              fontSize: "0.85rem",
                            }}
                          >
                            {inv.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: "#1f2937" }}>
                            {inv.vendorName || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "#10b981",
                              fontSize: "0.95rem",
                            }}
                          >
                            {/* {inv.totalAmount ? `€${parseFloat(inv.totalAmount).toFixed(2)}` : "—"} */}
                            {inv.totalAmount != null  ? `€${inv.totalAmount.toFixed(2)}`  : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            {inv.uploadedAt
                              ? new Date(inv.uploadedAt).toLocaleDateString("it-IT")
                              : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.75,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor:
                                inv.status === "Completed"
                                  ? "#d1fae5"
                                  : inv.status === "Failed"
                                    ? "#fee2e2"
                                    : "#fef3c7",
                              width: "fit-content",
                            }}
                          >
                            
                            {getStatusIcon(inv.status)}
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color:
                                  inv.status === "Completed"
                                    ? "#047857"
                                    : inv.status === "Failed"
                                      ? "#b91c1c"
                                      : "#92400e",
                              }}
                            >
                              {getStatusDescription(inv.status) || "Unknown"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => void showInvoiceDetail(inv.id)}
                              disabled={loadingDetailId === inv.id}
                              sx={{
                                color: "#667eea",
                                "&:hover": {
                                  backgroundColor: "#f3f4f6",
                                },
                              }}
                            >
                              {loadingDetailId === inv.id ? (
                                <CircularProgress size={18} />
                              ) : (
                                <VisibilityIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
