// src/components/MapView.jsx
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import Filters from "./Filters";
import SearchCNPJ from "./SearchCNPJ";

// Corrige o ícone padrão do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Coordenadas aproximadas dos estados do Brasil
const stateCenters = {
  AC: [-8.77, -70.55],
  AL: [-9.71, -35.73],
  AM: [-3.07, -61.66],
  AP: [1.41, -51.77],
  BA: [-12.96, -38.51],
  CE: [-3.71, -38.54],
  DF: [-15.83, -47.86],
  ES: [-19.19, -40.34],
  GO: [-16.64, -49.31],
  MA: [-2.55, -44.30],
  MG: [-18.10, -44.38],
  MS: [-20.51, -54.54],
  MT: [-12.64, -55.42],
  PA: [-5.53, -52.29],
  PB: [-7.24, -35.91],
  PE: [-8.28, -35.07],
  PI: [-8.28, -43.68],
  PR: [-24.89, -51.55],
  RJ: [-22.90, -43.20],
  RN: [-5.81, -36.59],
  RO: [-11.22, -62.80],
  RR: [1.99, -61.33],
  RS: [-30.01, -51.22],
  SC: [-27.33, -49.44],
  SE: [-10.90, -37.07],
  SP: [-23.55, -46.64],
  TO: [-10.25, -48.25],
};

// Componente para mudar a posição do mapa quando o filtro muda
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 7); // Zoom ajustado para o estado
    }
  }, [center, map]);
  return null;
}

export default function MapView() {
  const [revendas, setRevendas] = useState([]);
  const [meta, setMeta] = useState({ progresso: 0, ultimaAtualizacao: null });
  const [filters, setFilters] = useState({ estado: "", municipio: "" });
  const [position, setPosition] = useState([-14.235, -51.9253]); // Centro do Brasil

  // Busca dados de revendas
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/revendas`)
      .then((res) => res.json())
      .then(setRevendas)
      .catch((err) => console.error("Erro ao carregar revendas:", err));
  }, []);

  // Busca status/meta
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta`)
        .then((res) => res.json())
        .then(setMeta)
        .catch((err) => console.error("Erro ao carregar meta:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Atualiza centro do mapa conforme filtro
  useEffect(() => {
    if (filters.estado && stateCenters[filters.estado]) {
      setPosition(stateCenters[filters.estado]);
    }
  }, [filters.estado]);

  // Aplica filtros nas revendas
  const filteredRevendas = revendas.filter((r) => {
    return (
      (!filters.estado || r.uf === filters.estado) &&
      (!filters.municipio ||
        r.municipio.toLowerCase().includes(filters.municipio.toLowerCase()))
    );
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Filtros e Busca */}
      <Filters onChange={setFilters} />
      <SearchCNPJ revendas={revendas} />

      {/* Caixa de informações de atualização */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 10,
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0px 0px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p>
          <strong>Última atualização:</strong>{" "}
          {meta.ultimaAtualizacao
            ? new Date(meta.ultimaAtualizacao).toLocaleString()
            : "Carregando..."}
        </p>
        <p>
          <strong>Progresso:</strong> {meta.progresso}%
        </p>
      </div>

      {/* Mapa */}
      <MapContainer
        center={position}
        zoom={5}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ChangeMapView center={position} />
        {filteredRevendas.map((revenda, idx) =>
          revenda.latitude && revenda.longitude ? (
            <Marker
              key={idx}
              position={[revenda.latitude, revenda.longitude]}
            >
              <Popup>
                <strong>{revenda.razao_social}</strong> <br />
                CNPJ: {revenda.cnpj} <br />
                Classe: {revenda.classe} <br />
                Endereço: {revenda.rua}, {revenda.bairro}, {revenda.municipio} -{" "}
                {revenda.uf}, CEP {revenda.cep}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
