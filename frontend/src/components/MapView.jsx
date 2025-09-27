import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRevendas, fetchMeta } from "../services/api";

function MapView({ filtros }) {
  const [revendas, setRevendas] = useState([]);
  const [meta, setMeta] = useState({ progresso: 0, ultimaAtualizacao: null });

  useEffect(() => {
    async function carregar() {
      const dados = await fetchRevendas();
      setRevendas(dados);

      const info = await fetchMeta();
      setMeta(info);
    }
    carregar();
  }, []);

  // aplica filtros
  const revendasFiltradas = revendas.filter((r) => {
    if (filtros.estado && r.uf !== filtros.estado) return false;
    if (filtros.municipio && r.municipio !== filtros.municipio) return false;
    return true;
  });

  return (
    <div style={{ position: "relative" }}>
      {/* Caixa de informações (última atualização + progresso) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px",
          borderRadius: "8px",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        <p>
          Última atualização:{" "}
          {meta.ultimaAtualizacao
            ? new Date(meta.ultimaAtualizacao).toLocaleString()
            : "Carregando..."}
        </p>
        <p>Progresso: {meta.progresso}%</p>
      </div>

      {/* Mapa */}
      <MapContainer
        center={[-15.78, -47.93]} // centro do Brasil
        zoom={5}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {revendasFiltradas.map((revenda, index) =>
          revenda.latitude && revenda.longitude ? (
            <Marker
              key={index}
              position={[revenda.latitude, revenda.longitude]}
            >
              <Popup>
                <b>{revenda.razao_social}</b> <br />
                {revenda.municipio} - {revenda.uf} <br />
                CNPJ: {revenda.cnpj}
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
