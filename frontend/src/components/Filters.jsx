import React from "react";

function Filters({ onFilterChange }) {
  const handleChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div>
      <select name="estado" onChange={handleChange}>
        <option value="">Selecione Estado</option>
        <option value="SP">SP</option>
        <option value="RJ">RJ</option>
      </select>
      <input
        type="text"
        name="municipio"
        placeholder="Município"
        onChange={handleChange}
      />
    </div>
  );
}

export default Filters;