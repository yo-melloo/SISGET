import os
import asyncio
import json
import random
import httpx
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

# Configurações LifeWeb
URL      = os.getenv("LIFE_URL", "https://lifeonline.com.br/sistemas_v2/index.php")
EMPRESA  = os.getenv("LIFE_COMPANY")
USER     = os.getenv("LIFE_USER")
PASS     = os.getenv("LIFE_PASS")

# Configurações Backend SISGET
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080")
API_KEY     = os.getenv("INTERNAL_API_KEY", "sisget-secret-123")

if not all([EMPRESA, USER, PASS]):
    raise RuntimeError("Credenciais não configuradas no .env")

def try_parse_fleet(body: str) -> list | None:
    """
    Decodifica a resposta da frota em todos os formatos observados.
    """
    try:
        data = json.loads(body)
        if isinstance(data, list) and len(data) > 10:
            return data
        if isinstance(data, str):
            inner = json.loads(data)
            if isinstance(inner, list) and len(inner) > 10:
                return inner
    except (json.JSONDecodeError, TypeError):
        pass

    candidate = body
    for step in range(3):
        try:
            candidate = candidate.replace('\\"', '"')
            data = json.loads(candidate)
            if isinstance(data, list) and len(data) > 10:
                return data
        except (json.JSONDecodeError, ValueError):
            pass
    return None

async def push_to_backend(fleet_data: list):
    """
    Mapeia os campos do LifeWeb para o SISGET e envia via POST.
    """
    mapped_data = []
    for v in fleet_data:
        try:
            # Correção de Polaridade (Brasil: Lat < 0, Lng < 0)
            lat = float(v.get("RASTLATITUDE", 0))
            lng = float(v.get("RASTLONGITUDE", 0))
            
            if str(v.get("VEICPREFIXO")) == "20017":
                print(f"DEBUG [20017] RAW: {v}")
            
            if lat > 0: lat *= -1
            if lng > 0: lng *= -1
            
            speed = float(v.get("RASTVELOCIDADE", 0))
            
            mapped_data.append({
                "vehicleId": str(v.get("VEICCODIGO") or v.get("VEICPREFIXO", "")),
                "plate": v.get("VEICPLACA"),
                "latitude": lat,
                "longitude": lng,
                "speed": speed,
                "driverName": v.get("FUNCNOME"),
                "routeName": v.get("ROTANOME"),
                "areaName": v.get("AREANOME"),
                "status": v.get("STATUS"),
                "transmissionDate": v.get("RASTDATA"),
                "odometer": str(v.get("VEICODOMETRO", "0")),
                "fuelLevel": v.get("MED_VALOR"),
                "category": v.get("VEICCATNOME"),
                "rpm": str(v.get("RASTGIRO", "0"))
            })
        except (ValueError, TypeError):
            continue

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BACKEND_URL}/api/fleet/update-batch",
                json=mapped_data,
                headers={"X-Internal-Key": API_KEY},
                timeout=30.0
            )
            if resp.status_code == 200:
                print(f"[OK] Backend atualizado: {len(mapped_data)} veículos.")
            else:
                print(f"[ERROR] Falha no Backend ({resp.status_code}): {resp.text}")
    except Exception as e:
        print(f"[✗] Erro ao conectar no Backend: {e}")

async def check_auto_status() -> bool:
    """Consulta se o modo automático está ligado no backend"""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{BACKEND_URL}/api/fleet/auto-status", timeout=5.0)
            if resp.status_code == 200:
                return resp.json().get("active", False)
    except Exception:
        pass
    return False

async def run_once():
    """Executa um ciclo completo de raspagem"""
    print("\n" + "="*50)
    print(f"[*] INICIANDO CICLO DE RASTREAMENTO")
    
    fleet_data: list | None = None
    fleet_size: int = 0

    async def on_response(response):
        nonlocal fleet_data, fleet_size
        url = response.url
        if "lifeonline.com.br/sistemas_v2/index.php" not in url or "InclueScript" in url:
            return
        
        try:
            body = await response.text()
            if "VEICCODIGO" not in body: return
            
            has_gps = "RASTLATITUDE" in body
            if has_gps and len(body) > fleet_size:
                result = try_parse_fleet(body)
                if result:
                    fleet_data = result
                    fleet_size = len(result)
                    print(f"  [CAPTURADO] {len(result)} veículos ({len(body)//1024} KB)")
        except Exception:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        page.on("response", on_response)

        try:
            print("[*] Login LifeWeb...")
            await page.goto(URL, wait_until="networkidle", timeout=60000)
            await page.fill("#empresa", EMPRESA)
            await page.fill("#login", USER)
            await page.fill("#pass", PASS)
            await page.click("#btnLogin")
            await page.wait_for_load_state("networkidle")

            print("[*] Aceitando cookies e navegando...")
            # Clica no botão azul "Aceitar"
            try:
                await page.click("button:has-text('Aceitar')", timeout=5000)
                await asyncio.sleep(1)
            except Exception:
                pass

            # Tenta navegar via clique direto no ID para ser mais tático
            print("[*] Abrindo mapa de rastreamento...")
            try:
                # O ar-online é o ID do link de rastreamento no menu
                await page.evaluate("() => { const el = document.querySelector('#ar-online') || [...document.querySelectorAll('a')].find(a => a.innerText.includes('Rastreamento Online')); if(el) el.click(); }")
            except Exception:
                await page.goto("https://lifeonline.com.br/sistemas_v2/index.php?pag=ar-online", wait_until="networkidle")

            print("[*] Aguardando dados (12s)...")
            await asyncio.sleep(12) 

            if not fleet_data:
                print("[!] Tentando extração via DOM...")
                js_data = await page.evaluate("""
                    () => {
                        if (typeof Life !== 'undefined' && Life.RastreamentoOnline && typeof Life.RastreamentoOnline.getDsVeiculos === 'function') {
                            return Life.RastreamentoOnline.getDsVeiculos();
                        }
                        if (typeof dsVeiculos !== 'undefined') return dsVeiculos;
                        return null;
                    }
                """)
                if js_data: 
                    fleet_data = js_data
                    print(f"  [DOM] {len(js_data)} veículos extraídos via JS")

            if fleet_data:
                await push_to_backend(fleet_data)
            else:
                print("[-] Falha: Nenhum dado capturado. Verificando estado da página...")
                await page.screenshot(path="bot_fail.png", full_page=True)

        except Exception as e:
            print(f"[!] Erro no ciclo: {e}")
        finally:
            await browser.close()

async def main():
    import sys
    is_daemon = "--daemon" in sys.argv
    
    if is_daemon:
        print("[*] MODO DAEMON ATIVADO (Monitorando Backend)")
        while True:
            is_active = await check_auto_status()
            if is_active:
                await run_once()
                # Intervalo sugerido pelo usuário: 1:30 min - 2:00 min (90s - 120s)
                wait_time = random.randint(90, 120)
                print(f"[*] Ciclo finalizado. Aguardando {wait_time}s...")
                await asyncio.sleep(wait_time)
            else:
                # Se desativado, checa novamente a cada 10s
                await asyncio.sleep(10)
    else:
        await run_once()

if __name__ == "__main__":
    asyncio.run(main())
