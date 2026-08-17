import json
import re
import unicodedata
import uuid
from pathlib import Path

import pandas as pd

path = "/Users/rafa16vieira/Downloads/PLANILHA ADESIVOS.xlsx"
geo_path = Path("/Users/rafa16vieira/Projects/painel-alagoas/public/geo/alagoas-municipios.geojson")


def norm(s: str) -> str:
    s = str(s or "").strip().upper()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^A-Z0-9 ]+", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


geo = json.loads(geo_path.read_text())
cidades = {
    norm(f["properties"]["name"]): {
        "id": f["properties"]["id"],
        "nome": f["properties"]["name"],
    }
    for f in geo["features"]
}
aliases = {
    "UNIAO": "UNIAO DOS PALMARES",
    "SAO JOSE DA LAGE": "SAO JOSE DA LAJE",
}

rows = []
for sheet in pd.ExcelFile(path).sheet_names:
    df = pd.read_excel(path, sheet_name=sheet, header=None)
    header_idx = None
    for i, r in df.iterrows():
        vals = [str(x).strip().upper() if pd.notna(x) else "" for x in r.tolist()[:4]]
        if "CIDADE" in vals and any("VOTO" in v for v in vals):
            header_idx = i
            break
    data = df.iloc[header_idx + 1 :, :4].copy()
    data.columns = ["nome", "cidade", "votos", "coordenador"]
    data = data.dropna(how="all")
    for _, r in data.iterrows():
        nome = str(r["nome"]).strip() if pd.notna(r["nome"]) else ""
        cidade = str(r["cidade"]).strip() if pd.notna(r["cidade"]) else ""
        if not nome or nome.lower() == "nan":
            continue
        coord = "" if pd.isna(r["coordenador"]) else str(r["coordenador"]).strip()
        key = aliases.get(norm(cidade), norm(cidade))
        c = cidades.get(key)
        if not c:
            hits = [v for k, v in cidades.items() if k.startswith(key) or key.startswith(k)]
            if len(hits) == 1:
                c = hits[0]
            else:
                raise SystemExit(f"Cidade nao encontrada: {cidade!r} ({nome})")
        rows.append(
            {
                "id": str(uuid.uuid4()),
                "nome": nome,
                "cidade_id": c["id"],
                "quantidade_pessoas": int(r["votos"]),
                "responsavel": coord or "NTR",
            }
        )

print(json.dumps(rows, ensure_ascii=False))
