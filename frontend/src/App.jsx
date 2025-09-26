import React, { useState } from "react";
import MapView from "./components/MapView";
import Filters from "./components/Filters";
import SearchCNPJ from "./components/SearchCNPJ";

function App() {
  const [filters, setFilters] = useState({});
  const [cnpj, setCnpj] = useState("");

  return (
    <div>
      <h1>Revendas GLP - ANP</h1>
      <Filters onFilterChange={setFilters} />
      <SearchCNPJ onSearch={setCnpj} />
      <MapView filters={filters} cnpj={cnpj} />
    </div>
  );
}

export default App;