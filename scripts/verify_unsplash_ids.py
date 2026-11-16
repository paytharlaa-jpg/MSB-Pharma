import urllib.request
import urllib.error

candidate_ids = [
    # Chemistry / Lab / Science
    ('lab_flasks', 'photo-1532187863486-abf9dbad1b69'),
    ('scientist_pipette', 'photo-1582719478250-c89cae4dc85b'),
    ('microscope_research', 'photo-1579154204601-01588f351e67'),
    ('chemical_compounds', 'photo-1603555501671-8f96b3fce8e4'),
    ('pills_production', 'photo-1584308666744-24d5c474f2ae'),
    ('capsules_blister', 'photo-1587854692152-cbe660dbde88'),
    ('amber_vials', 'photo-1512069772995-ec65ed45afd6'),
    ('molecules_art', 'photo-1507668077129-56e32842fceb'),
    ('biotech_dna', 'photo-1530497610245-94d3c16cda28'),
    ('hplc_instrument', 'photo-1514733670139-4d87a1941d55'),
    ('lab_tubes', 'photo-1581093588401-fbb62a02f120'),
    ('petri_dish', 'photo-1576086213369-97a306d36557'),
    ('chemical_crystals', 'photo-1618005182384-a83a8bd57fbe'),

    # Logistics / Transport / Warehouse
    ('modern_warehouse', 'photo-1586528116311-ad8dd3c8310d'),
    ('warehouse_forklift', 'photo-1553413077-190dd305871c'),
    ('warehouse_shelving', 'photo-1587293852726-70cdb56c2866'),
    ('logistics_truck_road', 'photo-1601584115197-04ecc0da31d7'),
    ('white_delivery_truck', 'photo-1519003722824-194d4455a60c'),
    ('cargo_plane_freight', 'photo-1542296332-2e4473faf563'),
    ('cargo_ship_containers', 'photo-1541888946425-d0fbb186f5f7'),
    ('shipping_port_terminal', 'photo-1494412574643-ff11b0a5c1c3'),
    ('container_stack', 'photo-1578575437130-527eed3abbec'),
    ('fleet_trucks', 'photo-1508873696983-2df5293cb325'),
    ('delivery_van', 'photo-1526367790999-0150786686a2'),
    ('air_cargo_loading', 'photo-1436491865332-7a61a109cc05'),

    # Business / Dossier / Audit / Regulatory / HQ
    ('pharma_hq_building', 'photo-1486406146926-c627a92ad1ab'),
    ('modern_corporate_office', 'photo-1497366216548-37526070297c'),
    ('audit_papers_pen', 'photo-1450133064473-71024230f91b'),
    ('compliance_document', 'photo-1454165804606-c3d57bc86b40'),
    ('quality_checklist', 'photo-1455390582262-044cdead277a'),
    ('executive_review', 'photo-1551836022-d5d88e9218df'),
    ('hyderabad_city', 'photo-1570168007204-dfb528c6958f'),
]

valid_photos = {}
print("Testing Unsplash candidate IDs...")
for name, pid in candidate_ids:
    url = f"https://images.unsplash.com/{pid}?auto=format&fit=crop&w=400&q=80"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                valid_photos[name] = pid
                print(f"[VALID] {name} -> {pid}")
    except Exception as e:
        print(f"[INVALID] {name} -> {pid}")

print(f"\nTotal valid: {len(valid_photos)} / {len(candidate_ids)}")

