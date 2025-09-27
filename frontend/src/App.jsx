import React, { useState } from "react";
import Filters from "./components/Filters.jsx";
import SearchCNPJ from "./components/SearchCNPJ.jsx";
import MapView from "./components/MapView.jsx";

function App() {
  const [filters, setFilters] = useState({ estado: "", municipio: "", cnpj: "" });

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* 🔎 Barra de filtros e status */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "10px",
          background: "#f5f5f5",
          borderBottom: "1px solid #ccc",
          zIndex: 1000,
        }}
      >
        {/* Filtros e busca */}
        <div style={{ display: "flex", gap: "15px" }}>
          <Filters onChange={handleFilterChange} />
          <SearchCNPJ onChange={handleFilterChange} />
        </div>

        {/* Status de atualização */}
        <div
          style={{
            padding: "5px 15px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            fontSize: "14px",
            textAlign: "right",
          }}
        >
          <StatusInfo />
        </div>
      </div>

      {/* 🗺️ Mapa */}
      <div style={{ flex: 1 }}>
        <MapView filters={filters} />
      </div>
    </div>
  );
}

// 🔔 Componente para status (última atualização + progresso)
function StatusInfo() {
  const [meta, setMeta] = React.useState({ progresso: 0, ultimaAtualizacao: null });

  React.useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta`);
        const data = await res.json();
        setMeta(data);
      } catch (err) {
        console.error("Erro ao buscar meta:", err);
      }
    }
    fetchMeta();
    const interval = setInterval(fetchMeta, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>
        Última atualização:{" "}
        {meta.ultimaAtualizacao
          ? new Date(meta.ultimaAtualizacao).toLocaleString()
          : "Carregando..."}
      </p>
      <p>Progresso: {meta.progresso}%</p>
    </div>
  );
}

export default App;
