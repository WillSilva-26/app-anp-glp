import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Filters from "./Filters";

// Ícone customizado para os marcadores
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function MapView() {
  const [revendas, setRevendas] = useState([]);
  const [meta, setMeta] = useState({ ultimaAtualizacao: null, progresso: 0 });
  const [filtros, setFiltros] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL; // 👈 pega do .env

  // Buscar dados das revendas
  useEffect(() => {
    const fetchRevendas = async () => {
      try {
        const params = new URLSearchParams(filtros).toString();
        const res = await fetch(`${backendUrl}/revendas?${params}`);
        const data = await res.json();
        setRevendas(data);
      } catch (error) {
        console.error("Erro ao carregar revendas:", error);
      }
    };

    fetchRevendas();
  }, [filtros, backendUrl]);

  // Buscar metadados (atualização + progresso)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch(`${backendUrl}/meta`);
        const data = await res.json();
        setMeta(data);
      } catch (error) {
        console.error("Erro ao carregar meta:", error);
      }
    };

    fetchMeta();
    const interval = setInterval(fetchMeta, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const position = [-14.235, -51.925]; // centro aproximado do Brasil

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* Barra superior com atualização e progresso */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p>
          Última atualização:{" "}
          {meta.ultimaAtualizacao
            ? new Date(meta.ultimaAtualizacao).toLocaleString()
            : "Carregando..."}
        </p>
        <p>Progresso: {meta.progresso}%</p>
        {meta.progresso === 100 && (
          <button onClick={() => window.location.reload()}>
            🔄 Atualizar mapa
          </button>
        )}
      </div>

      {/* Filtros */}
      <Filters onFilterChange={setFiltros} />

      {/* Mapa */}
      <MapContainer
        center={position}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {revendas.map((revenda, idx) => (
          <Marker
            key={idx}
            position={[revenda.latitude, revenda.longitude]}
            icon={markerIcon}
          >
            <Popup>
              <b>{revenda.razao_social}</b> <br />
              {revenda.rua}, {revenda.bairro} <br />
              {revenda.municipio} - {revenda.uf} <br />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${revenda.latitude},${revenda.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 Abrir no Google Maps
              </a>
              <br />
              <a
                href={`https://waze.com/ul?ll=${revenda.latitude},${revenda.longitude}&navigate=yes`}
                target="_blank"
                rel="noopener noreferrer"
              >
                🚗 Abrir no Waze
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
