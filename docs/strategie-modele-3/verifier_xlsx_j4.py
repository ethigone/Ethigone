"""Vérifie les valeurs calculées enregistrées du XLSX, sans le modifier.

Usage : python verifier_xlsx_j4.py [dossier_des_4_cas_recalculés]
Les cas recalculés doivent se nommer cas-base.xlsx, cas-perte.xlsx,
cas-retard.xlsx et cas-collecte.xlsx. Aucun accès réseau.
"""
import json
import math
import pathlib
import sys
import zipfile
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent
NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
proof = json.loads((ROOT / 'preuves/j4-tableur.json').read_text())
result = json.loads((ROOT / 'data/resultats-j4.json').read_text())
rows = proof['calc_rows']

def inspect_xlsx(file, case):
    checks = 0
    with zipfile.ZipFile(file) as z:
        assert not any('externalLinks/' in n or 'vbaProject' in n for n in z.namelist())
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml'))]
        cells = {}
        for name in z.namelist():
            if name.startswith('xl/worksheets/sheet') and name.endswith('.xml'):
                xml = ET.fromstring(z.read(name))
                for c in xml.findall('.//s:sheetData/s:row/s:c', NS):
                    assert c.get('t') != 'e', (file.name, name, c.attrib, 'erreur Excel')
                    if name != 'xl/worksheets/sheet3.xml':
                        continue
                    v = c.find('s:v', NS)
                    if c.get('t') == 'inlineStr':
                        val = ''.join(c.find('s:is', NS).itertext())
                    elif v is None:
                        val = None
                    elif c.get('t') == 's':
                        val = strings[int(v.text)]
                    elif c.get('t') == 'str':
                        val = v.text
                    else:
                        val = float(v.text) if v.text is not None else None
                    cells[c.get('r')] = val
        for i, op in enumerate(['O1', 'O2', 'O3']):
            expected = next(x['values'] for x in result['cases'] if x['operation_id'] == op and x['case_id'] == case)
            for key, row in rows.items():
                actual = cells[f'{"DEF"[i]}{row}']
                target = expected[key]
                if target is None:
                    assert actual == 'n.a.', (op, case, key, actual)
                else:
                    assert isinstance(actual, (int, float)) and math.isclose(actual, target, abs_tol=1e-6, rel_tol=1e-10), (op, case, key, actual, target)
                checks += 1
    return checks

if __name__ == '__main__':
    baseline = inspect_xlsx(ROOT / 'modele-economique-j4.xlsx', 'base')
    native = 0
    if len(sys.argv) > 1:
        folder = pathlib.Path(sys.argv[1])
        for case in ['base', 'perte', 'retard', 'collecte']:
            native += inspect_xlsx(folder / f'cas-{case}.xlsx', case)
        proof['native_recalculation'] = {'engine': 'LibreOffice Calc headless', 'cases': 4, 'numeric_or_na_comparisons': native, 'passed': True, 'visual_native_app': False}
    proof['exported_xlsx_values_checked'] = baseline
    proof['export_has_no_macro_or_external_workbook'] = True
    (ROOT / 'preuves/j4-tableur.json').write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'xlsx_cached_values_checked': baseline, 'native_recalculated_values_checked': native, 'passed': True}))
