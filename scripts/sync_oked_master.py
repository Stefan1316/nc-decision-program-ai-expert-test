#!/usr/bin/env python3
"""Build NC Decision master OKED directory from the official BNS classifier JSON.

Official source:
https://stat.gov.kz/ru/classifiers/statistical/21/
This generator is the CI counterpart of scripts/sync_oked_master.mjs.
Classifier: ОКЭД НК РК 03-2019
Effective: 2020-01-01
BNS page updated: 2026-07-01 (as checked when integration was added).
"""
from __future__ import annotations

import json
import pathlib
import urllib.request

SOURCE_URL = "https://stat.gov.kz/upload/iblock/4f6/gli4uh5ur5wjni7ivqeegssfp02ebw04/%D0%9E%D0%9A%D0%AD%D0%94.JSON"
OUT = pathlib.Path("src/data/okedMaster.generated.ts")

SECTION_RANGES = [
    ("A", 1, 3), ("B", 5, 9), ("C", 10, 33), ("D", 35, 35),
    ("E", 36, 39), ("F", 41, 43), ("G", 45, 47), ("H", 49, 53),
    ("I", 55, 56), ("J", 58, 63), ("K", 64, 66), ("L", 68, 68),
    ("M", 69, 75), ("N", 77, 82), ("O", 84, 84), ("P", 85, 85),
    ("Q", 86, 88), ("R", 90, 93), ("S", 94, 96), ("T", 97, 98),
    ("U", 99, 99),
]

def display_code(raw: str) -> str:
    raw = raw.strip()
    if len(raw) == 1 and raw.isalpha():
        return raw.upper()
    if not raw.isdigit():
        return raw
    if len(raw) <= 2:
        return raw
    return raw[:2] + "." + raw[2:]

def level(raw: str) -> str:
    if len(raw) == 1 and raw.isalpha():
        return "section"
    return {2:"division", 3:"group", 4:"class", 5:"subclass"}.get(len(raw), "subclass")

def section_for(raw: str):
    if not raw.isdigit() or len(raw) < 2:
        return raw.upper() if len(raw) == 1 and raw.isalpha() else None
    division = int(raw[:2])
    for section, lo, hi in SECTION_RANGES:
        if lo <= division <= hi:
            return section
    return None

def parent_for(raw: str):
    if len(raw) == 1 and raw.isalpha():
        return None
    if raw.isdigit():
        if len(raw) == 2:
            return section_for(raw)
        if len(raw) in (3, 4, 5):
            return display_code(raw[:-1])
    return None

def main():
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "NC-Decision-OKED-Sync/1.0"})
    with urllib.request.urlopen(req, timeout=60) as response:
        payload = json.load(response)

    rows = next(iter(payload.values()))
    out = []
    seen = set()
    for item in rows:
        raw = str(item.get("CODE", "")).strip()
        if not raw or raw == "0":
            continue
        code = display_code(raw)
        if code in seen:
            continue
        seen.add(code)
        out.append({
            "code": code,
            "rawCode": raw,
            "nameRu": str(item.get("NAME_RU", "")).strip(),
            "nameKk": str(item.get("NAME_KZ", "")).strip(),
            "level": level(raw),
            "parentCode": parent_for(raw),
            "sectionCode": section_for(raw),
        })

    out.sort(key=lambda x: (0 if x["level"] == "section" else 1, x["rawCode"]))
    data = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    content = (
        "import { OkedMasterRecord } from './okedMasterTypes';\n\n"
        "// AUTO-GENERATED from the official Bureau of National Statistics OKED JSON.\n"
        "// Do not edit manually; run scripts/sync_oked_master.py.\n"
        f"export const OKED_MASTER_RECORDS: OkedMasterRecord[] = {data};\n"
    )
    OUT.write_text(content, encoding="utf-8")
    print(f"Wrote {len(out)} official OKED records to {OUT}")

if __name__ == "__main__":
    main()
