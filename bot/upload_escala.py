import pandas as pd
import requests
import json
import sys
import math

def format_time(t):
    if pd.isna(t):
        return None
    try:
        return t.strftime("%H:%M:%S")
    except:
        return str(t)

def extract_and_sync(file_path):
    print(f"Lendo arquivo: {file_path}")
    try:
        df = pd.read_excel(file_path, header=1, engine='openpyxl')
        df[['D. SEM', 'DATA']] = df[['D. SEM', 'DATA']].ffill()
    except Exception as e:
        print(f"Erro ao ler excel: {e}")
        return

    payload = []
    
    for _, row in df.iterrows():
        # Tratar a data corretamente para YYYY-MM-DD
        data_val = row['DATA']
        if pd.isna(data_val):
            continue
            
        data_str = data_val.strftime("%Y-%m-%d") if hasattr(data_val, 'strftime') else str(data_val)
        
        # Juntar motoristas se possivel (coluna 8)
        motorista_val = str(row['MOTORISTA IMP x STI/PGM']) if not pd.isna(row['MOTORISTA IMP x STI/PGM']) else ""
        
        carro_val = str(row['CARRO']) if not pd.isna(row['CARRO']) else ""
        if carro_val.endswith('.0'):
            carro_val = carro_val[:-2]

        servico_val = str(row['SERVIÇO']) if not pd.isna(row['SERVIÇO']) else ""
        if servico_val.endswith('.0'):
             servico_val = servico_val[:-2]
             
        if servico_val == "nan" or servico_val == "":
             continue # Servico obrigatorio
            
        dto = {
            "diaSemana": str(row['D. SEM']),
            "data": data_str,
            "garagem": str(row['BASE']),
            "carro": carro_val,
            "horarioGaragem": format_time(row['SAÍDA GAR.']),
            "horarioSaida": format_time(row['SAÍDA ROD.']),
            "origem": str(row['ORIGEM']),
            "destino": str(row['DESTINO']),
            "motorista": motorista_val,
            "linha": str(row['LINHA']),
            "servico": servico_val
        }
        
        # Limpar variaveis 'nan' do pandas
        for k, v in dto.items():
            if type(v) == str and v.lower() == 'nan':
                dto[k] = None
                
        payload.append(dto)
        
    print(f"Total de registros a sincronizar: {len(payload)}")
    
    # Enviar para a API
    url = "http://localhost:8080/api/escalas/sync"
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print("Sincronização com sucesso:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"Falha na sincronização: {e}")
        if e.response is not None:
             print(e.response.text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python upload_escala.py <caminho_do_arquivo.xlsx>")
    else:
        for file in sys.argv[1:]:
            extract_and_sync(file)
