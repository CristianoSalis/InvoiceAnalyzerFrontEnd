import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import { CssBaseline, Container } from "@mui/material";
import "./styles/global.css"; 

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Container>
        <Routes>
          <Route path="/" element={<UploadPage />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}