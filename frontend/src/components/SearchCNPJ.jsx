import React, { useState } from "react";

function SearchCNPJ({ onSearch }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Buscar por CNPJ"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Buscar</button>
    </form>
  );
}

export default SearchCNPJ;