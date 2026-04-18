import sqlite3
import requests
import json

def test_dnit_integration():
    db_path = "d:/Repositorios/solucoes-excel/SISGET/backend/sisget.db"
    vehicle_id = "25006"
    
    print(f"[*] PASSO 1: Buscando coordenadas do veiculo {vehicle_id} no banco...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT latitude, longitude FROM fleet_current WHERE vehicle_id=?", (vehicle_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            print("[!] Erro: Veiculo nao encontrado no banco. Rode o bot primeiro!")
            return
            
        lat, lon = row
        print(f"  > Posicao capturada: LAT {lat}, LON {lon}")
        
    except Exception as e:
        print(f"[!] Erro ao acessar banco: {e}")
        return

    print(f"[*] PASSO 2: Consultando nova API GeoServer do DNIT...")
    # Testaremos com um buffer de busca para garantir interseccao
    url = "https://servicos.dnit.gov.br/dnitgeo/geoserver/vgeo/ows"
    params = {
        "service": "WFS",
        "version": "1.0.0",
        "request": "GetFeature",
        "typeName": "vgeo:vw_snv_rod",
        "maxFeatures": 1,
        "outputFormat": "application/json",
        "cql_filter": f"DWITHIN(geom, POINT({lon} {lat}), 0.01, meters)"
    }
    
    try:
        resp = requests.get(url, params=params, timeout=15)
        print(f"[*] PASSO 3: Resposta recebida (Status {resp.status_code})")
        
        data = resp.json()
        print("\n[*] PASSO 4: JSON Bruto do DNIT:")
        print(json.dumps(data, indent=2))
        
        if data.get("features"):
            props = data["features"][0].get("properties", {})
            print("\n[*] PASSO 5: Analise de Campos:")
            print(f"  - Codigo BR: {props.get('cod_br')}")
            print(f"  - Marco KM: {props.get('vl_km')}")
            print(f"  - UF: {props.get('uf')}")
        else:
            print("\n[!] PASSO 5: DNAO ENCONTRADO. Ponto fora da malha federal ou erro de Buffer.")
            
    except Exception as e:
        print(f"[!] Erro na chamada da API: {e}")

if __name__ == "__main__":
    test_dnit_integration()
