import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function UserLocation({ setUserPosition }) {
  useMapEvents({
    locationfound(e) {
      setUserPosition(e.latlng);
    },
  });
  return null;
}

function MapView() {
  const [revendas, setRevendas] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [meta, setMeta] = useState({ progresso: 0, ultimaAtualizacao: null });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/revendas`)
      .then((res) => res.json())
      .then((data) => setRevendas(data));

    const interval = setInterval(() => {
      fetch(`${BACKEND_URL}/api/meta`)
        .then((res) => res.json())
        .then((data) => setMeta(data));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const position = userPosition || [-23.55052, -46.633308]; // São Paulo como fallback

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "white", padding: "5px", borderRadius: "8px" }}>
        <p>Última atualização: {meta.ultimaAtualizacao ? new Date(meta.ultimaAtualizacao).toLocaleString() : "Carregando..."}</p>
        <p>Progresso: {meta.progresso}%</p>
      </div>
      <MapContainer center={position} zoom={6} style={{ height: "500px", width: "100%" }} whenCreated={(map) => map.locate({ setView: true, maxZoom: 12 })}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <UserLocation setUserPosition={setUserPosition} />
        {revendas.map((revenda, idx) =>
          revenda.latitude && revenda.longitude ? (
            <Marker key={idx} position={[revenda.latitude, revenda.longitude]}>
              <Popup>
                <strong>{revenda.razao_social}</strong><br />
                {revenda.rua}, {revenda.bairro}, {revenda.municipio} - {revenda.uf}<br />
                CNPJ: {revenda.cnpj}<br />
                <a href={`https://waze.com/ul?ll=${revenda.latitude},${revenda.longitude}`} target="_blank" rel="noreferrer">Abrir no Waze</a><br />
                <a href={`https://www.google.com/maps?q=${revenda.latitude},${revenda.longitude}`} target="_blank" rel="noreferrer">Abrir no Maps</a>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
