import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import csvtojson from "csvtojson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import qr from "qrcode-terminal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0"; // Importante para rodar no Render
const ANP_URL =
  "https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/arquivos/arquivos-dados-cadastrais-das-revendas-de-gas-liquefeito-de-petroleo-glp/cadastro-revendas-glp.csv";

const DATA_PATH = path.join(DATA_DIR, "revendas.json");
const META_PATH = path.join(DATA_DIR, "meta.json");

// Função de geocodificação via Nominatim (OpenStreetMap)
async function geocodificar(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    endereco
  )}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "ANP-GLP-App" } });
    const data = await res.json();
    if (data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return { lat: null, lon: null };
  } catch (err) {
    console.error("Erro geocodificação:", err);
    return { lat: null, lon: null };
  }
}

// Atualizar dados da ANP
async function atualizarDados() {
  console.log("🔄 Atualizando dados da ANP...");
  const response = await fetch(ANP_URL);
  const csvData = await response.text();
  let jsonData = await csvtojson().fromString(csvData);

  jsonData = jsonData.map((r) => ({
    uf: r["UF"],
    municipio: r["Município"],
    cnpj: r["CNPJ"],
    razao_social: r["Razão Social"],
    classe: r["Classe"],
    rua: r["Logradouro"],
    bairro: r["Bairro"],
    cep: r["CEP"],
  }));

  const total = jsonData.length;
  let processed = 0;
  const processedData = [];

  for (const revenda of jsonData) {
    const endereco = `${revenda.rua}, ${revenda.bairro}, ${revenda.municipio}, ${revenda.uf}, ${revenda.cep}, Brasil`;
    const coords = await geocodificar(endereco);
    processedData.push({ ...revenda, latitude: coords.lat, longitude: coords.lon });

    processed++;
    const progresso = Math.round((processed / total) * 100);

    fs.writeFileSync(
      META_PATH,
      JSON.stringify({ progresso, ultimaAtualizacao: null }, null, 2)
    );
    if (processed % 100 === 0) {
      console.log(`📊 Progresso: ${progresso}% (${processed}/${total})`);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(processedData, null, 2));
  fs.writeFileSync(
    META_PATH,
    JSON.stringify(
      { progresso: 100, ultimaAtualizacao: new Date().toISOString() },
      null,
      2
    )
  );
  console.log("✅ Atualização concluída!");
}

// Endpoints
app.get("/api/revendas", (req, res) => {
  if (!fs.existsSync(DATA_PATH)) {
    return res.status(404).json({ error: "Dados ainda não disponíveis" });
  }
  res.json(JSON.parse(fs.readFileSync(DATA_PATH, "utf8")));
});

app.get("/api/meta", (req, res) => {
  if (!fs.existsSync(META_PATH)) {
    return res.json({ progresso: 0, ultimaAtualizacao: null });
  }
  res.json(JSON.parse(fs.readFileSync(META_PATH, "utf8")));
});

// Inicialização
app.listen(PORT, HOST, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
  if (!process.env.RAILWAY_STATIC_URL) {
    qr.generate(`http://localhost:${PORT}`, { small: true });
  }
  atualizarDados();
  setInterval(atualizarDados, 24 * 60 * 60 * 1000); // atualiza a cada 24h
});
