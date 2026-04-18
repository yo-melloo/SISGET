import sqlite3
import os

db_path = "d:/Repositorios/solucoes-excel/SISGET/backend/sisget.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(fleet_current);")
    columns = cursor.fetchall()
    print("Colunas em fleet_current:")
    for col in columns:
        print(f" - {col[1]} ({col[2]})")
    conn.close()
else:
    print(f"Arquivo não encontrado: {db_path}")
