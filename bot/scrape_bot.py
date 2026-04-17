import os
<<<<<<< HEAD:sisget/bot/scrape_bot.py
import asyncio
import json
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

URL    = os.getenv("LIFE_URL", "https://lifeonline.com.br/sistemas_v2/index.php")
EMPRESA = os.getenv("LIFE_COMPANY")
USER   = os.getenv("LIFE_USER")
PASS   = os.getenv("LIFE_PASS")

if not all([EMPRESA, USER, PASS]):
    raise RuntimeError("Credenciais não configuradas no .env")


def try_parse_fleet(body: str) -> list | None:
    """
    Decodifica a resposta da frota em todos os formatos observados:

    Caso 1 — JSON limpo (lista direta):
        [{\"VEICCODIGO\": ...}, ...]

    Caso 2 — Body com backslash-escaped quotes (formato real observado no 314KB):
        [{\\\"VEICCODIGO\\\": \\\"MABC1235\\\", ...}]
        → body é uma string onde cada \" virou \\\"
        → basta trocar \\\" por \" e parsear

    Caso 3 — Double-encoded (string JSON dentro de JSON):
        \"[{\\\"VEICCODIGO\\\": ...}]\"
        → json.loads retorna uma string, que precisa de segundo parse
    """
    # ── Caso 1: parse direto ──
    try:
        data = json.loads(body)
        if isinstance(data, list) and len(data) > 10:
            return data
        # Caso 3: a resposta é uma string JSON
        if isinstance(data, str):
            inner = json.loads(data)
            if isinstance(inner, list) and len(inner) > 10:
                return inner
    except (json.JSONDecodeError, TypeError):
        pass

    # ── Caso 2: backslash-escaped (o mais comum no 314KB) ──
    # O preview real mostrou: '[{\\\"VEICCODIGO\\\"' — cada " foi escapado com \"
    # Fazemos a limpeza progressiva: \\\" → \" → parse
    candidate = body
    for step in range(3):
        try:
            # Remove uma camada de escape
            candidate = candidate.replace('\\"', '"')
            data = json.loads(candidate)
            if isinstance(data, list) and len(data) > 10:
                return data
        except (json.JSONDecodeError, ValueError):
            pass

    return None


async def run():
    fleet_data: list | None = None
    fleet_size: int = 0

    async def on_response(response):
        nonlocal fleet_data, fleet_size

        url = response.url
        # Só interessa o endpoint principal da API
        if "lifeonline.com.br/sistemas_v2/index.php" not in url:
            return
        if "InclueScript" in url:
            return

        try:
            body = await response.text()
        except Exception:
            return

        # ── Filtro rápido: só avança se o body contém campos de frota ──
        if "VEICCODIGO" not in body:
            return

        # ── Critério de qualidade: queremos o payload MAIS RICO ──
        # O payload com GPS (RASTLATITUDE) tem ~314KB e contém a frota completa.
        # O payload sem GPS tem ~7KB e contém apenas veículos offline.
        has_gps    = "RASTLATITUDE" in body
        is_larger  = len(body) > fleet_size

        if has_gps and is_larger:
            result = try_parse_fleet(body)
            if result and len(result) > fleet_size:
                fleet_data = result
                fleet_size = len(result)
                gps_tag = "[GPS]" if has_gps else "[SEM-GPS]"
                print(f"  [CAPTURADO{gps_tag}] {len(result)} veículos ({len(body):,} bytes)")

        elif not fleet_data:
            # Fallback: aceita mesmo sem GPS se ainda não temos nenhum dado
            result = try_parse_fleet(body)
            if result:
                fleet_data = result
                fleet_size = len(result)
                print(f"  [CAPTURADO-FALLBACK] {len(result)} veículos ({len(body):,} bytes)")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/119.0.0.0 Safari/537.36"
            )
        )
        page = await ctx.new_page()

        # ── Login ──
        print("[*] Login...")
        await page.goto(URL, wait_until="networkidle")
        await page.fill("#empresa", EMPRESA)
        await page.fill("#login", USER)
        await page.fill("#pass", PASS)
        await page.click("#btnLogin")
        await page.wait_for_load_state("networkidle")
        print("[+] Login OK.")

        # Ativa interceptação ANTES de navegar para a seção de rastreamento
        page.on("response", on_response)

        # ── Navegação para Rastreamento Online ──
        print("[*] Navegando para rastreamento online...")
        await page.evaluate(
            "() => { const b = document.querySelector('button.cookie-btn') "
            "|| [...document.querySelectorAll('button')].find(el => el.innerText.includes('Aceitar')); "
            "if(b) b.click(); }"
        )
        await asyncio.sleep(1)

        try:
            await page.get_by_text("Acompanhamento").first.hover(timeout=5000)
            await asyncio.sleep(1)
            await page.get_by_text("Rastreamento").first.hover(timeout=5000)
            await asyncio.sleep(1)
        except Exception:
            pass

        try:
            await page.locator("#ar-online").click(timeout=5000)
        except Exception:
            await page.evaluate(
                "() => { const el = document.querySelector('#ar-online'); if(el) el.click(); }"
            )

        # ── Aguarda carregamento ──
        # O payload de 314KB chega depois que o mapa renderiza todos os marcadores.
        # 5 segundos são suficientes para o JS moderno terminar as chamadas AJAX.
        print("[*] Aguardando carregamento dos dados (5s)...")
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(5)

        # ── Pós-processamento: se ainda não capturamos tudo, tenta extrair do DOM ──
        if not fleet_data or fleet_size < 50:
            print("[!] Poucos veículos capturados via rede. Tentando extração via JS...")
            try:
                js_data = await page.evaluate("""
                    () => {
                        // O Life.RastreamentoOnline armazena os dados dos veículos
                        // na variável dsVeiculos após o init()
                        if (typeof Life !== 'undefined' &&
                            Life.RastreamentoOnline &&
                            typeof Life.RastreamentoOnline.getDsVeiculos === 'function') {
                            return Life.RastreamentoOnline.getDsVeiculos();
                        }
                        // Tenta acessar a variável privada diretamente
                        if (typeof private !== 'undefined' && private.dsVeiculos) {
                            return private.dsVeiculos;
                        }
                        return null;
                    }
                """)
                if js_data and isinstance(js_data, list) and len(js_data) > fleet_size:
                    fleet_data = js_data
                    fleet_size = len(js_data)
                    print(f"  [DOM] {fleet_size} veículos extraídos via JS")
            except Exception as e:
                print(f"  [DOM] Falhou: {e}")

        # ── Salva resultado ──
        if fleet_data:
            # Correção de Polaridade (Brasil: Lat < 0, Lng < 0)
            for v in fleet_data:
                try:
                    lat = float(v.get("RASTLATITUDE", 0))
                    lng = float(v.get("RASTLONGITUDE", 0))
                    # Se vierem positivas (comum em alguns exports mal formatados), invertemos
                    if lat > 0: v["RASTLATITUDE"] = str(lat * -1)
                    if lng > 0: v["RASTLONGITUDE"] = str(lng * -1)
                except (ValueError, TypeError):
                    continue

            output_path = os.path.join(os.path.dirname(__file__), "fleet_status.json")
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(fleet_data, f, ensure_ascii=False, indent=2)
            
            # Exporta também como JS para evitar erros de CORS em visualização local
            js_path = os.path.join(os.path.dirname(__file__), "fleet_data.js")
            with open(js_path, "w", encoding="utf-8") as f:
                f.write(f"window.fleetData = {json.dumps(fleet_data, ensure_ascii=False)};")

            print(f"\n[+] SUCESSO: {fleet_size} veículos extraídos -> {output_path}")
            print(f"[+] JS gerado para o Dashboard -> {js_path}")

            sample = fleet_data[0]
            has_gps_check = "RASTLATITUDE" in sample
            print(f"[+] Campos disponíveis ({len(sample)} colunas)  |  GPS: {'SIM' if has_gps_check else 'NÃO'}")
            for k, v in sample.items():
                print(f"    {k}: {str(v)[:80]}")
        else:
            print("\n[-] FALHA: Nenhum JSON de frota capturado.")
            print("    Verifique navegação, credenciais e se o site está respondendo.")

        await page.screenshot(path="scrape_result.png", full_page=True)
        await browser.close()


if __name__ == "__main__":
    asyncio.run(run())
=======
import json
import requests
from dotenv import load_dotenv

# Carrega ambiente
bot_dir = os.path.dirname(__file__)
env_path = os.path.join(bot_dir, ".env")
load_dotenv(env_path)

URL = os.getenv("LIFE_URL", "https://lifeonline.com.br/sistemas_v2/index.php")
EMPRESA = os.getenv("LIFE_COMPANY")
USER = os.getenv("LIFE_USER")
PASS = os.getenv("LIFE_PASS")

def scrape():
    if not all([EMPRESA, USER, PASS]):
        print("[-] Erro: Credenciais não configuradas no .env")
        return

    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest"
    })

    try:
        print("[*] Autenticando...")
        login_payload = {
            "EMPRESA": EMPRESA,
            "LOGIN": USER,
            "PASS": PASS,
            "CAPTCHARESP": "",
            "OpenFile": "c_login.php",
            "winMode": "F"
        }
        
        res_login = session.post(URL, data=login_payload, timeout=10)
        if '"success": "T"' not in res_login.text:
            print(f"[-] Falha no login: {res_login.text}")
            return

        print("[*] Coletando dados da frota (ds_rastreamentoOnline)...")
        data_payload = {
            "OpenFile": "ds_rastreamentoOnline.php",
            "winMode": "F"
        }
        
        res_data = session.post(URL, data=data_payload, timeout=30)
        body = res_data.text

        if "VEICCODIGO" not in body:
            print("[-] Erro: JSON de frota não encontrado na resposta.")
            return

        # Limpeza do JSON (o Life escapa aspas com \\")
        clean_body = body.replace('\\"', '"')
        # Às vezes o JSON vem envolto em aspas extras
        if clean_body.startswith('"') and clean_body.endswith('"'):
            clean_body = clean_body[1:-1]
            
        fleet_data = json.loads(clean_body)
        
        # Correção de Polaridade (Lat/Lng negativas para o Brasil)
        for v in fleet_data:
            try:
                lat = float(v.get("RASTLATITUDE", 0))
                lng = float(v.get("RASTLONGITUDE", 0))
                if lat > 0: v["RASTLATITUDE"] = str(lat * -1)
                if lng > 0: v["RASTLONGITUDE"] = str(lng * -1)
            except:
                continue

        # Salva resultados
        status_path = os.path.join(bot_dir, "fleet_status.json")
        js_path = os.path.join(bot_dir, "fleet_data.js")
        
        with open(status_path, "w", encoding="utf-8") as f:
            json.dump(fleet_data, f, ensure_ascii=False, indent=2)
            
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(f"window.fleetData = {json.dumps(fleet_data, ensure_ascii=False)};")

        print(f"[+] SUCESSO: {len(fleet_data)} veículos extraídos em tempo recorde.")
        
    except Exception as e:
        print(f"[-] Erro crítico no scraper: {e}")

if __name__ == "__main__":
    scrape()
>>>>>>> 31b01da (feat: centralize Satélite Norte project and SISGET into root repository):Satélite Norte/sisget/bot/scrape_bot.py
