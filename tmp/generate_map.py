import json, math

with open('/tmp/kz_2.json') as f:
    d2 = json.load(f)

min_lon, max_lon = 46.492, 87.313
min_lat, max_lat = 40.552, 55.432
mid_lat = 48.0
cos_lat = math.cos(math.radians(mid_lat))
scale = 34.4
offset_x = 30
offset_y = 565

def project(lon, lat):
    x = offset_x + (lon - min_lon) * cos_lat * scale
    y = offset_y - (lat - min_lat) * scale
    return round(x, 1), round(y, 1)

def simplify_points(pts, tol=0.04):
    if len(pts) <= 4:
        return pts
    def point_line_dist(p, a, b):
        dx = b[0] - a[0]
        dy = b[1] - a[1]
        norm = dx*dx + dy*dy
        if norm == 0:
            return math.hypot(p[0]-a[0], p[1]-a[1])
        u = ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / norm
        u = max(0, min(1, u))
        ix = a[0] + u*dx
        iy = a[1] + u*dy
        return math.hypot(p[0]-ix, p[1]-iy)

    def dp(arr):
        if len(arr) <= 2:
            return arr
        dmax = 0
        idx = 0
        for i in range(1, len(arr)-1):
            d = point_line_dist(arr[i], arr[0], arr[-1])
            if d > dmax:
                dmax = d
                idx = i
        if dmax > tol:
            rec1 = dp(arr[:idx+1])
            rec2 = dp(arr[idx:])
            return rec1[:-1] + rec2
        else:
            return [arr[0], arr[-1]]
            
    return dp(pts)

def geom_to_svg_path(geom):
    paths = []
    if geom['type'] == 'Polygon':
        polys = [geom['coordinates']]
    elif geom['type'] == 'MultiPolygon':
        polys = geom['coordinates']
    else:
        return ''

    for poly in polys:
        # Exterior ring only (or large rings)
        ext = poly[0]
        if len(ext) < 4:
            continue
        simp = simplify_points(ext)
        if len(simp) < 3:
            continue
        proj = [project(p[0], p[1]) for p in simp]
        d_str = 'M ' + ' L '.join(f'{x},{y}' for x, y in proj) + ' Z'
        paths.append(d_str)

    return ' '.join(paths)

# Group features by 17 regions + 3 republican cities
REGION_DEFS = [
    {
        'id': 'west-kz-region',
        'name': 'Западно-Казахстанская область',
        'nameKk': 'Батыс Қазақстан облысы',
        'center': 'Орал / Уральск',
        'code': '07',
        'match': lambda p: p.get('NAME_1') == 'West Kazakhstan'
    },
    {
        'id': 'atyrau-region',
        'name': 'Атырауская область',
        'nameKk': 'Атырау облысы',
        'center': 'Атырау',
        'code': '06',
        'match': lambda p: p.get('NAME_1') == 'Atyrau'
    },
    {
        'id': 'mangystau-region',
        'name': 'Мангистауская область',
        'nameKk': 'Маңғыстау облысы',
        'center': 'Ақтау',
        'code': '12',
        'match': lambda p: p.get('NAME_1') == 'Mangghystau'
    },
    {
        'id': 'aktobe-region',
        'name': 'Актюбинская область',
        'nameKk': 'Ақтөбе облысы',
        'center': 'Ақтөбе',
        'code': '04',
        'match': lambda p: p.get('NAME_1') == 'Aqtöbe'
    },
    {
        'id': 'kostanay-region',
        'name': 'Костанайская область',
        'nameKk': 'Қостанай облысы',
        'center': 'Қостанай',
        'code': '10',
        'match': lambda p: p.get('NAME_1') == 'Qostanay'
    },
    {
        'id': 'north-kz-region',
        'name': 'Северо-Казахстанская область',
        'nameKk': 'Солтүстік Қазақстан облысы',
        'center': 'Петропавл',
        'code': '15',
        'match': lambda p: p.get('NAME_1') == 'North Kazakhstan'
    },
    {
        'id': 'akmola-region',
        'name': 'Акмолинская область',
        'nameKk': 'Ақмола облысы',
        'center': 'Көкшетау',
        'code': '03',
        'match': lambda p: p.get('NAME_1') == 'Aqmola'
    },
    {
        'id': 'pavlodar-region',
        'name': 'Павлодарская область',
        'nameKk': 'Павлодар облысы',
        'center': 'Павлодар',
        'code': '14',
        'match': lambda p: p.get('NAME_1') == 'Pavlodar'
    },
    {
        'id': 'karaganda-region',
        'name': 'Карагандинская область',
        'nameKk': 'Қарағанды облысы',
        'center': 'Қарағанды',
        'code': '09',
        'match': lambda p: p.get('NAME_1') == 'Qaraghandy' and p.get('NAME_2') not in ['Ulytauskiy', 'Zhanaarkinskiy']
    },
    {
        'id': 'ulytau-region',
        'name': 'Улытауская область',
        'nameKk': 'Ұлытау облысы',
        'center': 'Жезқазған',
        'code': '20',
        'match': lambda p: p.get('NAME_1') == 'Qaraghandy' and p.get('NAME_2') in ['Ulytauskiy', 'Zhanaarkinskiy']
    },
    {
        'id': 'kyzylorda-region',
        'name': 'Кызылординская область',
        'nameKk': 'Қызылорда облысы',
        'center': 'Қызылорда',
        'code': '11',
        'match': lambda p: p.get('NAME_1') == 'Qyzylorda'
    },
    {
        'id': 'turkestan-region',
        'name': 'Туркестанская область',
        'nameKk': 'Түркістан облысы',
        'center': 'Түркістан',
        'code': '13',
        'match': lambda p: p.get('NAME_1') == 'South Kazakhstan' and p.get('NAME_2') != 'Shymkent'
    },
    {
        'id': 'zhambyl-region',
        'name': 'Жамбылская область',
        'nameKk': 'Жамбыл облысы',
        'center': 'Тараз',
        'code': '08',
        'match': lambda p: p.get('NAME_1') == 'Zhambyl'
    },
    {
        'id': 'almaty-region',
        'name': 'Алматинская область',
        'nameKk': 'Алматы облысы',
        'center': 'Қонаев',
        'code': '05',
        'match': lambda p: p.get('NAME_1') == 'Almaty' and p.get('NAME_2') in ['Balkhashskiy', 'Enbekshikazakhskiy', 'Iliyskiy', 'Karasayskiy', 'Raiymbekskiy', 'Talgarskiy', 'Uygurskiy', 'Zhambylskiy']
    },
    {
        'id': 'zhetysu-region',
        'name': 'Жетысуская область',
        'nameKk': 'Жетісу облысы',
        'center': 'Талдықорған',
        'code': '19',
        'match': lambda p: p.get('NAME_1') == 'Almaty' and any(sub in p.get('NAME_2', '') for sub in ['Aksu', 'Alakol', 'Karatal', 'Kerbulak', 'Koksu', 'Panfilov', 'Sarkand', 'Taldyqorghan'])
    },
    {
        'id': 'abay-region',
        'name': 'Абайская область',
        'nameKk': 'Абай облысы',
        'center': 'Семей',
        'code': '18',
        'match': lambda p: p.get('NAME_1') == 'East Kazakhstan' and any(sub in p.get('NAME_2', '') for sub in ['Abay', 'Ayagoz', 'Beskaragay', 'Borodulikhin', 'Kokpektin', 'Semipalatin', 'Urdzhar', 'Zharmin', 'Tarbagatay'])
    },
    {
        'id': 'east-kz-region',
        'name': 'Восточно-Казахстанская область',
        'nameKk': 'Шығыс Қазақстан облысы',
        'center': 'Өскемен',
        'code': '16',
        'match': lambda p: p.get('NAME_1') == 'East Kazakhstan' and not any(sub in p.get('NAME_2', '') for sub in ['Abay', 'Ayagoz', 'Beskaragay', 'Borodulikhin', 'Kokpektin', 'Semipalatin', 'Urdzhar', 'Zharmin', 'Tarbagatay'])
    }
]

output_regions = []

for rdef in REGION_DEFS:
    feats = [f for f in d2['features'] if rdef['match'](f['properties'])]
    # collect all paths
    combined_d = []
    all_x, all_y = [], []
    for f in feats:
        p_str = geom_to_svg_path(f['geometry'])
        if p_str:
            combined_d.append(p_str)
        # approximate centroid
        ext_coords = f['geometry']['coordinates']
        if f['geometry']['type'] == 'Polygon':
            for pt in ext_coords[0]:
                px, py = project(pt[0], pt[1])
                all_x.append(px)
                all_y.append(py)
        elif f['geometry']['type'] == 'MultiPolygon':
            for poly in ext_coords:
                for pt in poly[0]:
                    px, py = project(pt[0], pt[1])
                    all_x.append(px)
                    all_y.append(py)

    avg_x = round(sum(all_x) / len(all_x)) if all_x else 500
    avg_y = round(sum(all_y) / len(all_y)) if all_y else 300

    output_regions.append({
        'id': rdef['id'],
        'name': rdef['name'],
        'nameKk': rdef['nameKk'],
        'center': rdef['center'],
        'code': rdef['code'],
        'isCity': False,
        'labelX': avg_x,
        'labelY': avg_y,
        'svgPath': ' '.join(combined_d)
    })

# Add 3 republican cities
CITIES = [
    {
        'id': 'astana-city',
        'name': 'г. Астана (Столица)',
        'nameKk': 'Астана қ. (Елорда)',
        'center': 'г. Астана',
        'code': '01',
        'lon': 71.43,
        'lat': 51.17
    },
    {
        'id': 'almaty-city',
        'name': 'г. Алматы',
        'nameKk': 'Алматы қ.',
        'center': 'г. Алматы',
        'code': '02',
        'lon': 76.95,
        'lat': 43.24
    },
    {
        'id': 'shymkent-city',
        'name': 'г. Шымкент',
        'nameKk': 'Шымкент қ.',
        'center': 'г. Шымкент',
        'code': '17',
        'lon': 69.60,
        'lat': 42.32
    }
]

for c in CITIES:
    cx, cy = project(c['lon'], c['lat'])
    output_regions.append({
        'id': c['id'],
        'name': c['name'],
        'nameKk': c['nameKk'],
        'center': c['center'],
        'code': c['code'],
        'isCity': True,
        'labelX': int(cx),
        'labelY': int(cy),
        'svgPath': f'M {cx},{cy} m -16,0 a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0'
    })

print(f'Generated {len(output_regions)} regions.')
for r in output_regions[:5]:
    lx = r['labelX']
    ly = r['labelY']
    print(r['id'], len(r['svgPath']), f'Center: ({lx}, {ly})')

with open('/tmp/kazakhstan_accurate_regions.json', 'w') as out_f:
    json.dump(output_regions, out_f, ensure_ascii=False)
