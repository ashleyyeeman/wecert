"""Regenerate the static browser catalogues from the reviewed Traditional Chinese TSV.

Requires opencc-python-reimplemented (development tool only).
Run from the repository root: python scripts/build-locales.py
"""
from pathlib import Path
import json
from opencc import OpenCC

root = Path(__file__).resolve().parent.parent
traditional = dict(line.split('\t', 1) for line in (root / 'locales/zh-Hant.tsv').read_text().splitlines() if line)
converter = OpenCC('t2s')
catalogues = {'zh-Hant': traditional, 'zh-Hans': {key: converter.convert(value) for key, value in traditional.items()}}
(root / 'translations.js').write_text("'use strict';\n\n// Generated from locales/zh-Hant.tsv; no runtime translation service is used.\nconst localeMessages = " + json.dumps(catalogues,ensure_ascii=False,indent=2) + ';\n')
