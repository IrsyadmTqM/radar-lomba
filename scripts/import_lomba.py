#!/usr/bin/env python3
"""Convert the "Lomba Aktif" sheet (Database_Lomba.xlsx) into src/lib/competitions.ts.

Usage:  python3 -I scripts/import_lomba.py path/to/Database_Lomba.xlsx

Each sheet row (1-based, header excluded) gets one explicit decision below, so the
output is reviewable and repeatable. Rows not listed in INCLUDE are skipped with a reason.
The report is written to docs/import-lomba-report.md.
"""
import json, re, sys, datetime
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
TODAY = datetime.date(2026, 11, 27)  # sheet verified 26 Nov 2026; deadlines before today are dropped

# row -> (category, subcategory, deadline ISO date, (min, max) or None = not stated -> default 1-4)
INCLUDE = {
    4:   ("Essay",    "Scientific paper",    "2026-11-29", (2, 3)),
    5:   ("Business", "Business plan",       "2026-11-29", (2, 3)),
    6:   ("Business", "Trading simulation",  "2026-12-06", (1, 2)),
    12:  ("Business", "Business plan",       "2026-12-11", (2, 3)),
    13:  ("Business", "Business plan",       "2026-12-05", (1, 3)),
    16:  ("Tech",     "Hackathon",           "2026-11-30", (5, 5)),
    20:  ("Tech",     "Hackathon",           "2026-12-12", (3, 5)),
    21:  ("Design",   "Architecture",        "2027-02-10", None),
    23:  ("Design",   "Architecture",        "2026-11-30", None),
    24:  ("Design",   "UI/UX",               "2026-11-30", None),
    25:  ("Design",   "Landscape design",    "2026-11-30", None),
    26:  ("Design",   "Poster",              "2026-11-27", None),
    27:  ("Design",   "Poster",              "2026-12-31", None),
    30:  ("Design",   "Poster",              "2026-11-30", None),
    33:  ("Essay",    "Ideas article",       "2026-11-30", None),
    42:  ("Design",   "Photography",         "2026-12-15", None),
    44:  ("Design",   "Video",               "2026-11-30", (1, 3)),
    48:  ("Design",   "Video",               "2027-01-01", None),
    50:  ("Design",   "Video",               "2026-11-30", None),
    59:  ("Design",   "Poster",              "2026-11-30", None),
    61:  ("Tech",     "Robotics",            "2026-11-30", None),
    71:  ("Design",   "Environmental design","2026-11-30", None),
    72:  ("Essay",    "Ideas paper",         "2026-12-04", (3, 4)),
    74:  ("Essay",    "Scientific poster",   "2026-12-09", (1, 3)),
    87:  ("Business", "Startup",             "2026-12-04", None),
    88:  ("Design",   "Short film",          "2026-12-01", None),
    91:  ("Essay",    "Debate",              "2026-12-31", (2, 3)),
    97:  ("Business", "Startup",             "2027-01-04", (2, 4)),
    100: ("Business", "Business plan",       "2027-01-29", (2, 4)),
}

SKIP = {
    "Khusus pelajar (SD/SMP/SMA/SMK), bukan mahasiswa": [7, 8, 9, 10, 11, 17, 18, 19, 32, 36, 40, 62, 82, 85, 86, 94],
    "Perorangan saja, tidak ada tim yang bisa dibentuk": [1, 2, 3, 29, 31, 34, 35, 37, 38, 39, 41, 43, 49, 73, 76, 84, 89, 90],
    "Kategori tidak cocok dengan Tech/Business/Design/Essay (tari, musik, e-sport, olahraga, kuliner, catur)": [51, 52, 53, 54, 55, 56, 57, 58, 60, 63, 64, 65, 66, 67, 68, 69, 70, 79, 80, 81, 92, 93, 95, 96, 98, 99],
    "Deadline sudah lewat (sebelum 27 Nov 2026)": [22, 75],
    "Khusus kampus/daerah/profesi tertentu atau syarat tidak jelas": [15, 28, 45, 46, 47, 77, 78, 83],
    "Program belajar, bukan lomba": [14],
}

def trunc(s, n):
    s = s.strip()
    if len(s) <= n:
        return s
    return s[: n - 1].rsplit(" ", 1)[0].rstrip(",;: ") + "…"

def rewards(text):
    out = []
    for part in re.split(r";|\. ", text):
        part = part.strip(" .")
        if not part or re.search(r"tidak (dicantumkan|dirinci|menyatakan|terlihat|ada)", part, re.I):
            continue
        out.append(trunc(part, 90))
    return out[:3]

def main(xlsx):
    wb = openpyxl.load_workbook(xlsx, data_only=True)
    rows = [r for r in wb["Lomba Aktif"].iter_rows(values_only=True)]
    hdr = rows[0]
    data = [dict(zip(hdr, r)) for r in rows[1:] if any(r)]
    assert len(data) == 100, len(data)

    seen = set(INCLUDE) | {i for v in SKIP.values() for i in v}
    assert seen == set(range(1, 101)) and len(INCLUDE) + sum(map(len, SKIP.values())) == 100, "every row needs exactly one decision"

    comps, rep_in = [], []
    for i in sorted(INCLUDE):
        o = {k: ("" if v is None else str(v)).strip() for k, v in data[i - 1].items()}
        cat, sub, dl, size = INCLUDE[i]
        assert datetime.date.fromisoformat(dl) >= TODAY, (i, dl)
        stated = size is not None
        mn, mx = size or (1, 4)
        req = o["Syarat Tim/Peserta"].rstrip(". ")
        if not stated:
            req += ". Ukuran tim belum disebut di sumber, jadi diisi default 1–4. Cek aturan resmi."
        else:
            req += "."
        if ";" in o["Deadline"] or "(" in o["Deadline"]:
            req += f" Deadline di sumber: {o['Deadline']}."
        comps.append({
            "id": f"c-{i:03d}",
            "name": o["Nama Lomba"],
            "organizer": o["Penyelenggara"] or "Not stated",
            "category": cat,
            "subcategory": sub,
            "link": o["Link Pendaftaran"],
            "registration_deadline": f"{dl}T23:59:00+07:00",
            "min_team_size": mn,
            "max_team_size": mx,
            "requirements": req,
            "rewards": rewards(o["Hadiah"]),
        })
        rep_in.append((i, o["Nama Lomba"], cat, dl, f"{mn}–{mx}", "dari sumber" if stated else "default"))

    body = ",\n".join("  " + json.dumps(c, ensure_ascii=False) for c in comps)
    (ROOT / "src/lib/competitions.ts").write_text(
        "// Generated by scripts/import_lomba.py from Database_Lomba.xlsx (sheet verified 26 Nov 2026).\n"
        "// Do not edit by hand: change the script and run it again.\n"
        'import type { Competition } from "./types";\n\n'
        f"export const IMPORTED_COMPETITIONS: Competition[] = [\n{body},\n];\n",
        encoding="utf-8",
    )

    by_cat = {}
    for r in rep_in:
        by_cat[r[2]] = by_cat.get(r[2], 0) + 1
    n_def = sum(1 for r in rep_in if r[5] == "default")
    lines = [
        "# Laporan impor data lomba",
        "",
        "Sumber: `Database_Lomba.xlsx`, sheet **Lomba Aktif** (100 baris, diverifikasi 26 Nov 2026). "
        "Dibuat oleh `scripts/import_lomba.py`.",
        "",
        f"**Masuk ke aplikasi: {len(rep_in)} lomba** ({', '.join(f'{k} {v}' for k, v in sorted(by_cat.items()))}). "
        f"**Dilewati: {100 - len(rep_in)}.** Ukuran tim dari sumber: {len(rep_in) - n_def}, default 1–4: {n_def}.",
        "",
        "## Masuk",
        "",
        "| Baris | Lomba | Kategori | Deadline | Tim | Ukuran tim |",
        "|---|---|---|---|---|---|",
    ] + [f"| {a} | {b} | {c} | {d} | {e} | {f} |" for a, b, c, d, e, f in rep_in] + ["", "## Dilewati", ""]
    for reason, ids in SKIP.items():
        lines.append(f"### {reason} ({len(ids)})")
        lines.append("")
        lines += [f"- {i}. {data[i-1]['Nama Lomba']}" for i in ids]
        lines.append("")
    (ROOT / "docs/import-lomba-report.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"imported {len(rep_in)}, skipped {100-len(rep_in)}, by category {by_cat}, default team size {n_def}")

main(sys.argv[1])
