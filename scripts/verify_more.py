import urllib.request

more_candidates = [
    ('chem_beaker_liquid', 'photo-1563170351-be82bc888aa4'),
    ('chemistry_research_lab', 'photo-1532094349884-543bc11b234d'),
    ('medical_lab_pipette', 'photo-1527613426441-4da17471b66d'),
    ('cleanroom_technician', 'photo-1581093458791-9f3c3900df4b'),
    ('pharma_cleanroom_inspect', 'photo-1581093806997-124204d9fa9d'),
    ('tablets_capsules_pack', 'photo-1584017911766-d451b3d0e843'),
    ('pills_medicine_close', 'photo-1471864190281-a93a3070b6de'),
    ('pharmacy_medicine_bottles', 'photo-1585435557343-3b092031a831'),
    ('hand_holding_medicine', 'photo-1584362917165-526a968579e8'),
    ('blood_reagent_testing', 'photo-1582719508461-905c673771fd'),
    ('warehouse_boxes_pallets', 'photo-1565793298595-6a879b1d9492'),
    ('cargo_pallets_racks', 'photo-1580674684081-7617fbf3d745'),
    ('distribution_racks_deep', 'photo-1586528116493-a029325540fa'),
    ('delivery_fleet_trucks', 'photo-1568228079869-459010493740'),
    ('airplane_runway_freight', 'photo-1559297434-fae8a1916a79'),
    ('modern_architecture_glass', 'photo-1512917774080-9991f1c4c750'),
    ('city_night_skyline', 'photo-1540959733332-eab4deabeeaf'),
    ('abstract_chemistry_cells', 'photo-1507668077129-56e32842fceb'),
    ('chromatography_vials_tray', 'photo-1579154204601-01588f351e67'),
    ('crystals_microscope', 'photo-1518770660439-4636190af475'),
    ('blue_chemical_crystal', 'photo-1518152006812-edab29b069ac'),
    ('scientist_microscope_bio', 'photo-1579165466791-788226ab77b6'),
]

for name, pid in more_candidates:
    url = f"https://images.unsplash.com/{pid}?auto=format&fit=crop&w=400&q=80"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status == 200:
                print(f"[VALID] {name} -> {pid}")
    except Exception as e:
        print(f"[INVALID] {name} -> {pid}")

