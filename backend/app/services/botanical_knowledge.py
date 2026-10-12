"""
Curated botanical knowledge base and disease diagnosis engine.
Provides scientifically accurate data for plant profiles, offline identification,
and pathology diagnostics.
"""

BOTANICAL_SPECIES = [
    {
        "common_name": "Monstera Deliciosa (Swiss Cheese Plant)",
        "scientific_name": "Monstera deliciosa",
        "family": "Araceae",
        "category": "Indoor",
        "confidence": 0.96,
        "description": "Famous for its natural leaf fenestrations (holes), the Monstera deliciosa is an iconic tropical climbing vine native to Central America.",
        "light": "Bright, indirect sunlight. Avoid direct midday sun which scorches leaves.",
        "water": "Allow the top 2-3 inches (5-7 cm) of soil to dry out between waterings. Typically every 7-10 days.",
        "soil": "Chunky, aerated aroid mix with peat moss, perlite, and orchid bark.",
        "humidity": "60-80% optimal, tolerates standard indoor humidity (40-50%).",
        "pet_toxicity": "Toxic to cats and dogs (contains calcium oxalate crystals). Keep out of reach.",
        "propagation": "Stem cuttings with at least one node and aerial root in water or sphagnum moss.",
        "ideal_temp": "18°C - 30°C (65°F - 85°F)",
        "common_problems": [
            "Yellow leaves from overwatering or root moisture stress",
            "Brown crispy tips caused by low ambient humidity",
            "Lack of fenestrations due to insufficient light levels"
        ],
        "care_tips": [
            "Wipe large leaves regularly with a damp microfiber cloth to remove dust",
            "Provide a moss pole or trellis to support upright climbing growth",
            "Rotate the pot 90 degrees weekly for symmetrical foliage development"
        ]
    },
    {
        "common_name": "Snake Plant (Mother-in-Law's Tongue)",
        "scientific_name": "Dracaena trifasciata",
        "family": "Asparagaceae",
        "category": "Indoor",
        "confidence": 0.98,
        "description": "An exceptionally resilient succulent plant with upright, sword-like variegated leaves that purify indoor air.",
        "light": "Very adaptable: thrives in bright indirect light, tolerates low light and fluorescent lighting.",
        "water": "Very drought tolerant. Water thoroughly only when soil is completely dry (every 2-4 weeks).",
        "soil": "Fast-draining cactus and succulent mix or gritty sandy potting soil.",
        "humidity": "Average household humidity (30-50%). Avoid damp conditions.",
        "pet_toxicity": "Mildly toxic to pets if ingested (saponins).",
        "propagation": "Leaf cuttings in water/soil or root rhizome division when repotting.",
        "ideal_temp": "15°C - 27°C (60°F - 80°F)",
        "common_problems": [
            "Mushy brown base from overwatering and root rot",
            "Wrinkled drooping leaves indicating extreme dehydration"
        ],
        "care_tips": [
            "Never allow water to sit in the center rosette",
            "Underwatering is always safer than overwatering with snake plants"
        ]
    },
    {
        "common_name": "Fiddle Leaf Fig",
        "scientific_name": "Ficus lyrata",
        "family": "Moraceae",
        "category": "Indoor",
        "confidence": 0.94,
        "description": "A magnificent indoor tree with large, violin-shaped glossy leaves, popular in contemporary interior architecture.",
        "light": "Consistent bright indirect light with 2-3 hours of gentle morning sun.",
        "water": "Water when top 2 inches dry out. Water until it drains, then empty the drip tray.",
        "soil": "Rich, well-draining potting soil with perlite.",
        "humidity": "50-65% preferred; sensitive to dry winter heating.",
        "pet_toxicity": "Toxic to dogs and cats due to irritating milky sap.",
        "propagation": "Stem tip cuttings or air layering during active spring growth.",
        "ideal_temp": "18°C - 24°C (65°F - 75°F)",
        "common_problems": [
            "Brown spots in leaf centers usually indicate root rot from poor drainage",
            "Leaf drop when moved suddenly or exposed to cold drafts"
        ],
        "care_tips": [
            "Keep in a stable location away from air conditioners or heating vents",
            "Shake the trunk gently each week to simulate wind and strengthen the stem"
        ]
    },
    {
        "common_name": "Golden Pothos (Devil's Ivy)",
        "scientific_name": "Epipremnum aureum",
        "family": "Araceae",
        "category": "Indoor",
        "confidence": 0.97,
        "description": "A fast-growing cascading vine with heart-shaped emerald green leaves marbled with creamy yellow highlights.",
        "light": "Moderate to bright indirect light; tolerates lower light conditions well.",
        "water": "Allow top 50% of soil to dry between waterings (roughly every 7-10 days).",
        "soil": "Standard aerated indoor potting mix with peat and perlite.",
        "humidity": "40-70%; very adaptable to standard indoor humidity.",
        "pet_toxicity": "Toxic to pets (contains insoluble calcium oxalates).",
        "propagation": "Single node cuttings root effortlessly in plain tap water in 2 weeks.",
        "ideal_temp": "18°C - 28°C (65°F - 82°F)",
        "common_problems": [
            "Loss of golden variegation when kept in deep shade",
            "Yellowing lower leaves from persistent wet soil"
        ],
        "care_tips": [
            "Trim long vines in spring to encourage bushier, fuller top growth"
        ]
    },
    {
        "common_name": "Peace Lily",
        "scientific_name": "Spathiphyllum wallisii",
        "family": "Araceae",
        "category": "Indoor",
        "confidence": 0.95,
        "description": "An elegant tropical plant known for glossy dark green foliage and long-lasting white spathes (flowers).",
        "light": "Low to medium indirect light. Direct sun causes leaf scorch.",
        "water": "Keep soil lightly moist but not waterlogged. The plant dramatially droops when thirsty and perks up rapidly after watering.",
        "soil": "Peat-rich, moisture-retentive potting mix with good drainage.",
        "humidity": "50-70% humidity keeps leaves glossy and tips green.",
        "pet_toxicity": "Toxic to cats and dogs (calcium oxalates cause oral irritation).",
        "propagation": "Crown division during spring repotting.",
        "ideal_temp": "18°C - 27°C (65°F - 80°F)",
        "common_problems": [
            "Brown tips from tap water minerals or fluoride sensitivity",
            "Failure to bloom due to insufficient indirect light"
        ],
        "care_tips": [
            "Use filtered or rainwater if leaf tips turn brown from municipal tap water"
        ]
    },
    {
        "common_name": "Sweet Basil",
        "scientific_name": "Ocimum basilicum",
        "family": "Lamiaceae",
        "category": "Herb",
        "confidence": 0.95,
        "description": "An aromatic culinary annual herb revered for fresh Mediterranean cooking, pesto, and sauces.",
        "light": "Full sun (at least 6-8 hours of direct sunshine per day).",
        "water": "Keep soil consistently moist. Water at the base to prevent fungal leaf spot.",
        "soil": "Rich, moist, organic, well-draining loam.",
        "humidity": "40-60%. Good airflow is critical.",
        "pet_toxicity": "Non-toxic to cats and dogs.",
        "propagation": "Seeds germinate in 5-7 days; stem cuttings root in water in days.",
        "ideal_temp": "20°C - 30°C (68°F - 86°F)",
        "common_problems": [
            "Pinching flowers: pinch off flower buds to prolong leafy vegetative harvest",
            "Downy mildew if air circulation is stagnant and leaves remain wet"
        ],
        "care_tips": [
            "Pinch back stem tips every 2 weeks to create a bushy, high-yield plant"
        ]
    },
    {
        "common_name": "Aloe Vera",
        "scientific_name": "Aloe barbadensis miller",
        "family": "Asphodelaceae",
        "category": "Succulent",
        "confidence": 0.97,
        "description": "A stemless succulent with thick, fleshy, serrated leaves filled with soothing therapeutic gel.",
        "light": "Bright direct to strong indirect light (south or west facing window).",
        "water": "Soak and dry method: water deeply, then let soil dry out completely (every 2-3 weeks).",
        "soil": "Gritty cactus mix containing pumice, sand, and perlite.",
        "humidity": "Low humidity (30-40%).",
        "pet_toxicity": "Toxic to pets (aloins cause gastrointestinal upset).",
        "propagation": "Separate root pups (offsets) once they reach 3-4 inches tall.",
        "ideal_temp": "13°C - 27°C (55°F - 80°F)",
        "common_problems": [
            "Brown soft leaves from overwatering or poorly draining soil",
            "Pale thin leaves reaching for light (etiolation)"
        ],
        "care_tips": [
            "Plant in terracotta pots with drainage holes to allow rapid root drying"
        ]
    },
    {
        "common_name": "Garden Tomato",
        "scientific_name": "Solanum lycopersicum",
        "family": "Solanaceae",
        "category": "Vegetable",
        "confidence": 0.96,
        "description": "The quintessential warm-season vegetable garden crop prized for juicy, savory, sun-ripened fruit.",
        "light": "Full direct sun (8+ hours daily).",
        "water": "Deep, consistent watering (1-2 inches per week) to prevent blossom end rot and skin splitting.",
        "soil": "Fertile, loose loam enriched with aged compost, pH 6.2 - 6.8.",
        "humidity": "50-70%.",
        "pet_toxicity": "Green foliage and unripened fruit are toxic to pets (solanine). Ripe fruit is safe in small amounts.",
        "propagation": "Sow seeds indoors 6-8 weeks before final spring frost.",
        "ideal_temp": "21°C - 29°C (70°F - 85°F)",
        "common_problems": [
            "Blossom end rot caused by calcium deficiency linked with erratic watering",
            "Early blight or powdery mildew during warm humid periods"
        ],
        "care_tips": [
            "Stake or cage indeterminate varieties and mulch the soil base to retain even moisture"
        ]
    }
]

DISEASE_DIAGNOSES = [
    {
        "keywords": ["yellow", "chlorosis", "pale", "wet", "mushy"],
        "condition_name": "Overwatering & Early Root Hypoxia",
        "severity": "Moderate",
        "confidence": 0.91,
        "description": "Saturated soil has starved the fine feeder roots of oxygen, preventing nutrient absorption and causing generalized leaf yellowing and turgor loss.",
        "observed_symptoms": [
            "Uniform yellowing of lower older leaves",
            "Soil remaining wet or damp for more than 10-14 days",
            "Soft or limp leaf texture despite damp soil substrate",
            "Faint musty odor near the root base"
        ],
        "contributing_factors": [
            "Pots lacking adequate bottom drainage holes",
            "Dense, moisture-retaining soil with insufficient perlite/bark",
            "Watering on a strict calendar rather than testing soil moisture depth"
        ],
        "recommendations": {
            "immediate_actions": [
                "Pause all watering immediately. Allow the pot to dry out significantly.",
                "Inspect the bottom drainage holes to ensure excess water flows out freely.",
                "If the soil is heavily waterlogged, gently slide the plant out of its pot onto newspaper to air-dry the root ball for 24 hours."
            ],
            "cultural_controls": [
                "Always check soil with a wooden skewer or finger before watering: top 2 inches should be dry.",
                "Switch to a porous terracotta pot if using plastic in low-light environments."
            ],
            "organic_remedies": [
                "Dilute 3% hydrogen peroxide (1 tbsp per cup of water) as a one-time soil drench to oxygenate roots and suppress fungal spores."
            ],
            "isolation_needed": False,
            "expert_consultation": "If leaves develop black squishy stems or foul smell persists, root rot has set in and affected roots must be excised with sterile shears."
        }
    },
    {
        "keywords": ["white", "powder", "dust", "mildew", "spotted"],
        "condition_name": "Powdery Mildew (Erysiphales)",
        "severity": "Moderate",
        "confidence": 0.88,
        "description": "A prevalent fungal infection that manifests as superficial white, flour-like fungal coatings across leaf surfaces, stems, and buds.",
        "observed_symptoms": [
            "Talctum-like white or grayish powdery patches on upper leaf surfaces",
            "Curling or distortion of newly emerging foliage",
            "Premature yellowing and leaf drop in untreated areas"
        ],
        "contributing_factors": [
            "High humidity coupled with stagnant, poor air circulation",
            "Shady conditions and overhead leaf wetting during evening hours"
        ],
        "recommendations": {
            "immediate_actions": [
                "Prune heavily infected leaves using sterile scissors and dispose in trash (do not compost).",
                "Increase air circulation around the plant with a gentle oscillating fan."
            ],
            "cultural_controls": [
                "Water strictly at soil level; keep foliage dry.",
                "Relocate plant to a brighter position with superior indirect sunlight."
            ],
            "organic_remedies": [
                "Spray affected leaves with a gentle organic solution: 1 tbsp baking soda + 1/2 tsp mild liquid castile soap in 1 liter of warm water.",
                "Cold-pressed neem oil spray (diluted according to label) applied in the evening to prevent sun scorch."
            ],
            "isolation_needed": True,
            "expert_consultation": "Consult a local agricultural extension if spore coverage exceeds 50% of the entire foliage canopy."
        }
    },
    {
        "keywords": ["web", "motes", "mites", "stippling", "bronze", "dots"],
        "condition_name": "Two-Spotted Spider Mites (Tetranychidae)",
        "severity": "High",
        "confidence": 0.89,
        "description": "Microscopic sap-sucking arachnids that puncture plant cells, resulting in fine yellow stippling and delicate silky webbing in leaf axils.",
        "observed_symptoms": [
            "Fine yellow or pale speckled stippling on leaf tops",
            "Silky micro-webbing between stems and undersides of leaves",
            "Dull, dusty, bronzed appearance of affected foliage"
        ],
        "contributing_factors": [
            "Dry, hot, low-humidity indoor environments (especially near heaters)",
            "Drought-stressed plants are particularly vulnerable"
        ],
        "recommendations": {
            "immediate_actions": [
                "Isolate the plant immediately to protect neighboring houseplants.",
                "Give the plant a gentle lukewarm shower, washing the undersides of leaves thoroughly to dislodge mite populations."
            ],
            "cultural_controls": [
                "Elevate ambient humidity above 60% with a room humidifier (spider mites hate humidity).",
                "Keep soil properly hydrated according to the plant's species needs."
            ],
            "organic_remedies": [
                "Apply insecticidal soap or diluted pure neem oil to top and bottom leaf surfaces every 4-5 days for 3 cycles to eradicate newly hatched nymphs."
            ],
            "isolation_needed": True,
            "expert_consultation": "If infestation spreads to commercial or greenhouse crops, consider releasing beneficial predatory mites (Phytoseiulus persimilis)."
        }
    },
    {
        "keywords": ["brown", "crisp", "dry", "edges", "tips", "burn"],
        "condition_name": "Low Humidity & Water Mineral Burn",
        "severity": "Low",
        "confidence": 0.93,
        "description": "Environmental stress caused by dry indoor air and accumulation of tap water salts, chlorine, or fluorides at leaf margins.",
        "observed_symptoms": [
            "Crispy, dry, dark brown leaf tips or outer margins",
            "Leaves feel papery rather than supple",
            "New growth is healthy but older leaf edges turn brown"
        ],
        "contributing_factors": [
            "Indoor air humidity below 35% (common in heated or air-conditioned rooms)",
            "Municipal tap water containing high chlorine, fluoride, or dissolved salts"
        ],
        "recommendations": {
            "immediate_actions": [
                "Trim unsightly brown tips with clean shears, leaving a thin margin of brown to avoid wounding healthy green tissue.",
                "Flush the potting soil thoroughly with distilled or rainwater to leach out accumulated salts."
            ],
            "cultural_controls": [
                "Group tropical plants together or set the pot on a pebble tray filled with water.",
                "Use filtered, distilled, or rainwater for sensitive varieties (like Calatheas, Palms, and Peace Lilies)."
            ],
            "organic_remedies": [
                "Run an ultrasonic cool-mist humidifier nearby to maintain 50-60% relative humidity."
            ],
            "isolation_needed": False,
            "expert_consultation": "Not contagious. No chemical treatments needed."
        }
    }
]

def find_species_by_query(query: str):
    query_lower = query.lower()
    for sp in BOTANICAL_SPECIES:
        if (query_lower in sp["common_name"].lower() or 
            query_lower in sp["scientific_name"].lower() or
            query_lower in sp["category"].lower()):
            return sp
    return BOTANICAL_SPECIES[0]

def diagnose_by_symptoms(symptoms_text: str):
    symptoms_lower = symptoms_text.lower()
    for diag in DISEASE_DIAGNOSES:
        for kw in diag["keywords"]:
            if kw in symptoms_lower:
                return diag
    # Default to first diagnosis (overwatering / moisture stress)
    return DISEASE_DIAGNOSES[0]
