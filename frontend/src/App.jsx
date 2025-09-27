import React, { useState, useEffect } from "react";
import MapView from "./components/MapView";
import Filters from "./components/Filters";
import SearchCNPJ from "./components/SearchCNPJ";

function App() {
  const [revendas, setRevendas] = useState([]);
  const [meta, setMeta] = useState({ progresso: 0, ultimaAtualizacao: null });
  const [filtros, setFiltros] = useState({ estado: "", municipio: "", cnpj: "" });

  // Carrega dados do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resRevendas = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/revendas`);
        const dataRevendas = await resRevendas.json();
        setRevendas(dataRevendas);

        const resMeta = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/meta`);
        const dataMeta = await resMeta.json();
        setMeta(dataMeta);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };
    fetchData();
  }, []);

  // Gera lista de estados únicos
  const estados = [...new Set(revendas.map((r) => r.uf))].sort();

  // Gera lista de municípios baseados no estado selecionado
  const municipios = filtros.estado
    ? [...new Set(revendas.filter((r) => r.uf === filtros.estado).map((r) => r.municipio))].sort()
    : [];

  // Atualiza filtros
  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  // Filtra revendas
  const revendasFiltradas = revendas.filter((r) => {
    if (filtros.estado && r.uf !== filtros.estado) return false;
    if (filtros.municipio && r.municipio !== filtros.municipio) return false;
    if (filtros.cnpj && !r.cnpj.includes(filtros.cnpj)) return false;
    return true;
  });

  return (
    <div>
      <h1>Buscar Revenda GLP</h1>

      {/* Filtros e busca */}
      <Filters estados={estados} municipios={municipios} filtros={filtros} handleChange={handleChange} />
      <SearchCNPJ filtros={filtros} setFiltros={setFiltros} />

      {/* Mapa */}
      <MapView revendas={revendasFiltradas} meta={meta} />
    </div>
  );
}

export default App;
