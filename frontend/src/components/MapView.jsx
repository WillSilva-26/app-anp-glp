import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícone customizado
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapView({ revendas, meta }) {
  const [position, setPosition] = useState([-14.235, -51.925]); // Brasil central

  return (
    <div style={{ position: "relative" }}>
      {/* Caixa de status no canto superior direito */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "white",
          padding: "8px",
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
      </div>

      <MapContainer
        center={position}
        zoom={5}
        style={{ height: "600px", width: "100%" }}
        whenCreated={(map) =>
          map.locate({ setView: true, maxZoom: 12 }).on("locationfound", (e) => {
            setPosition([e.latitude, e.longitude]);
            map.flyTo([e.latitude, e.longitude], 12);
          })
        }
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {revendas.map((r, i) =>
          r.latitude && r.longitude ? (
            <Marker
              key={i}
              position={[r.latitude, r.longitude]}
              icon={markerIcon}
            >
              <Popup>
                <b>{r.razao_social}</b> <br />
                {r.rua}, {r.bairro} <br />
                {r.municipio} - {r.uf} <br />
                CNPJ: {r.cnpj} <br />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no Google Maps
                </a>
                <br />
                <a
                  href={`https://waze.com/ul?ll=${r.latitude},${r.longitude}&navigate=yes`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no Waze
                </a>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
