import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, Linking, Alert } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { Picker } from "@react-native-picker/picker";
import { getRevendasGLP, getMunicipios, RevendaGLP } from "./src/api";
import { distanceBetween } from "./src/utils/haversine";

export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [revendas, setRevendas] = useState<RevendaGLP[]>([]);
  const [uf, setUf] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [municipiosList, setMunicipiosList] = useState<string[]>([]);
  const [cnpj, setCnpj] = useState("");
  const [useGps, setUseGps] = useState(true);

  // Pede permissão GPS
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUseGps(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  // Carrega municípios ao mudar UF
  useEffect(() => {
    if (uf) {
      getMunicipios(uf).then(setMunicipiosList).catch(() => setMunicipiosList([]));
    }
  }, [uf]);

  async function buscar() {
    try {
      const data = await getRevendasGLP({ uf, municipio, cnpj });
      if (useGps && location) {
        data.forEach((r) => {
          if (r.latitude && r.longitude) {
            r.distance_km = distanceBetween(
              location.coords.latitude,
              location.coords.longitude,
              r.latitude,
              r.longitude
            );
          }
        });
        data.sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
      }
      setRevendas(data);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível carregar as revendas");
    }
  }

  function abrirMapa(r: RevendaGLP) {
    if (!r.latitude || !r.longitude) return;
    Alert.alert("Abrir no mapa", "Escolha o app", [
      { text: "Google Maps", onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`) },
      { text: "Waze", onPress: () => Linking.openURL(`https://waze.com/ul?ll=${r.latitude},${r.longitude}&navigate=yes`) },
      { text: "Street View", onPress: () => Linking.openURL(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${r.latitude},${r.longitude}`) },
      { text: "Cancelar", style: "cancel" }
    ]);
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {!useGps && (
        <>
          <Text>Filtro:</Text>
          <Picker selectedValue={uf} onValueChange={setUf}>
            <Picker.Item label="Selecione UF" value="" />
            <Picker.Item label="SP" value="SP" />
            <Picker.Item label="RJ" value="RJ" />
            <Picker.Item label="MG" value="MG" />
          </Picker>
          <Picker selectedValue={municipio} onValueChange={setMunicipio}>
            <Picker.Item label="Selecione Município" value="" />
            {municipiosList.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
          <TextInput placeholder="CNPJ (opcional)" value={cnpj} onChangeText={setCnpj} style={{ borderWidth: 1, marginVertical: 5, padding: 5 }} />
        </>
      )}

      <Button title="Buscar" onPress={buscar} />

      <MapView style={{ flex: 1, marginTop: 10 }} initialRegion={{
        latitude: location?.coords.latitude || -15.78,
        longitude: location?.coords.longitude || -47.93,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      }}>
        {revendas.map((r, idx) =>
          r.latitude && r.longitude ? (
            <Marker
              key={idx}
              coordinate={{ latitude: r.latitude, longitude: r.longitude }}
              title={r.nome_fantasia || r.razao_social}
              description={r.endereco}
              onPress={() => abrirMapa(r)}
            />
          ) : null
        )}
      </MapView>

      <FlatList
        data={revendas}
        keyExtractor={(item, i) => item.cnpj ?? i.toString()}
        renderItem={({ item }) => (
          <View style={{ borderBottomWidth: 1, padding: 5 }}>
            <Text>{item.nome_fantasia || item.razao_social}</Text>
            <Text>{item.endereco}</Text>
            {item.distance_km && <Text>{item.distance_km.toFixed(1)} km</Text>}
          </View>
        )}
      />
    </View>
  );
}