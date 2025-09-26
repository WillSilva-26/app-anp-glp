import axios from "axios";

export type RevendaGLP = {
  cnpj?: string;
  nome_fantasia?: string;
  razao_social?: string;
  endereco?: string;
  municipio?: string;
  uf?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
};

// Troque para o IP da sua máquina onde roda o backend
const BASE_URL = "http://192.168.0.1:4000/api";

export async function getRevendasGLP(filters: { uf?: string; municipio?: string; cnpj?: string }) {
  const resp = await axios.get(`${BASE_URL}/revendas-glp`, { params: filters });
  return resp.data as RevendaGLP[];
}

export async function getMunicipios(uf: string): Promise<string[]> {
  const resp = await axios.get(`${BASE_URL}/municipios`, { params: { uf } });
  return resp.data;
}