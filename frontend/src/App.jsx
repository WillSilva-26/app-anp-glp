import { useState, useEffect } from "react";
import MapView from "./components/MapView";
import { fetchRevendas } from "./services/api";

function App() {
  const [filtros, setFiltros] = useState({ estado: "", municipio: "" });
  const [revendas, setRevendas] = useState([]);
  const [municipios, setMunicipios] = useState([]);

  // carregar dados apenas uma vez para extrair estados e municípios
  useEffect(() => {
    async function carregar() {
      const dados = await fetchRevendas();
      setRevendas(dados);
    }
    carregar();
  }, []);

  // atualizar lista de municípios quando estado mudar
  useEffect(() => {
    if (filtros.estado) {
      const listaMunicipios = revendas
        .filter((r) => r.uf === filtros.estado)
        .map((r) => r.municipio);
      setMunicipios([...new Set(listaMunicipios)]);
    } else {
      setMunicipios([]);
    }
  }, [filtros.estado, revendas]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>📍 Revendas de GLP - ANP</h1>

      {/* Filtros */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Filtro por estado */}
        <select
          name="estado"
          value={filtros.estado}
          onChange={handleFiltroChange}
        >
          <option value="">Selecione Estado</option>
          {[...new Set(revendas.map((r) => r.uf))].map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>

        {/* Filtro por município */}
        <select
          name="municipio"
          value={filtros.municipio}
          onChange={handleFiltroChange}
          disabled={!filtros.estado}
        >
          <option value="">Selecione Município</option>
          {municipios.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Mapa */}
      <MapView filtros={filtros} />
    </div>
  );
}

export default App;
