import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ColumnDetailPage } from "./pages/ColumnDetailPage";
import { ColumnsListPage } from "./pages/ColumnsListPage";
import { NewsDetail } from "./pages/NewsDetail";
import { PortalHome } from "./pages/PortalHome";
import "./components/portal/portal.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortalHome />} />
        <Route path="/colunas" element={<ColumnsListPage />} />
        <Route path="/colunas/:slug" element={<ColumnDetailPage />} />
        <Route path="/noticia/:slug" element={<NewsDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
