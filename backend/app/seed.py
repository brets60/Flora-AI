import os
from datetime import datetime, timedelta, timezone
from app.core.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.models import User, Plant, CareReminder, CareLog, Article, Notification, GrowthRecord

ARTICLES_DATA = [
    {
        "title": "Mastering Monstera Deliciosa Care",
        "slug": "mastering-monstera-deliciosa",
        "category": "Indoor Plants",
        "image_url": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
        "summary": "Everything you need to know about lighting, soil aeration, humidity, and staking for giant fenestrated leaves.",
        "difficulty": "Easy",
        "light_req": "Bright, indirect sunlight",
        "water_req": "Allow top 2-3 inches of soil to dry out",
        "common_problems": [
            {"issue": "No leaf fenestrations", "fix": "Increase sunlight exposure—plants need bright indirect light to split."},
            {"issue": "Yellow lower leaves", "fix": "Check for soggy soil or clogged drainage holes."}
        ],
        "step_by_step": [
            "Place in a spot that receives 6+ hours of soft, indirect daylight.",
            "Water when topsoil feels dry; thoroughly saturate until water drains freely.",
            "Insert a sturdy moss pole as the plant matures to support aerial root climbing.",
            "Wipe leaves monthly with a damp cloth to maximize photosynthesis."
        ],
        "attribution": "FloraAI Botanical Guild",
        "content": (
            "Monstera Deliciosa, often celebrated as the Swiss Cheese Plant, is an epiphyte native to the tropical rainforests "
            "of southern Mexico. In their natural habitat, they use aerial roots to scale tall trees towards the canopy light.\n\n"
            "### Lighting Requirements\n"
            "Position your Monstera within 3-5 feet of an east-facing or filtered south/west window. Direct harsh sun will scorch "
            "the foliage, while dim corners will cause slow growth and smaller, solid leaves without fenestrations.\n\n"
            "### Watering & Aeration\n"
            "Overwatering is the single most common cause of Monstera decline. Use a porous potting blend rich in orchid bark, "
            "perlite, and peat moss. Always discard standing water in the drainage tray after 15 minutes."
        )
    },
    {
        "title": "The Resilient Snake Plant Guide",
        "slug": "resilient-snake-plant-guide",
        "category": "Succulents & Cacti",
        "image_url": "https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=800&q=80",
        "summary": "Why the Snake Plant (Dracaena trifasciata) is the ultimate beginner houseplant and how to avoid overwatering.",
        "difficulty": "Easy",
        "light_req": "Adaptable: Low light to bright indirect",
        "water_req": "Water only when soil is completely bone dry",
        "common_problems": [
            {"issue": "Mushy leaves at the base", "fix": "Immediate overwatering signal. Stop watering and excise rotted leaves."},
            {"issue": "Wrinkled, folded foliage", "fix": "Severe dehydration. Give a deep, thorough bottom soaking."}
        ],
        "step_by_step": [
            "Use a terracotta pot with ample drainage holes.",
            "Fill with gritty cactus/succulent potting soil.",
            "Water every 2 to 4 weeks depending on ambient temperature and season.",
            "Keep in temperatures above 55°F (13°C)."
        ],
        "attribution": "International Succulent Society",
        "content": (
            "Snake Plants are virtually indestructible architectural succulents. They thrive on neglect and possess the unusual "
            "ability to perform Crassulacean Acid Metabolism (CAM), absorbing carbon dioxide and releasing oxygen at night."
        )
    },
    {
        "title": "Diagnosing & Treating Powdery Mildew Naturally",
        "slug": "treating-powdery-mildew-naturally",
        "category": "Plant Diseases",
        "image_url": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
        "summary": "Non-chemical, gentle remedies to defeat white powdery fungal outbreaks without harming your plants or beneficial pollinators.",
        "difficulty": "Medium",
        "light_req": "Ensure adequate sunlight to discourage fungal dampness",
        "water_req": "Water soil directly; avoid wetting foliage",
        "common_problems": [
            {"issue": "White flour-like dust on leaves", "fix": "Spray with potassium bicarbonate or baking soda mild soap solution."},
            {"issue": "Stunted shoot buds", "fix": "Prune severely affected sections and improve surrounding air ventilation."}
        ],
        "step_by_step": [
            "Isolate the infected plant from other vegetation.",
            "Prune infected foliage using scissors sanitized in 70% isopropyl alcohol.",
            "Mix 1 tablespoon of baking soda and 1/2 teaspoon of organic liquid soap into 1 liter of lukewarm water.",
            "Spray evenly on upper and lower leaf surfaces during overcast mornings."
        ],
        "attribution": "Organic Gardeners Federation",
        "content": (
            "Powdery mildew is caused by specialized fungal organisms that target foliage in warm, dry weather combined with "
            "stagnant relative humidity. Catching the infestation early is vital to prevent leaf drop and harvest loss."
        )
    },
    {
        "title": "The Art of Clean Plant Propagation",
        "slug": "clean-plant-propagation-techniques",
        "category": "Propagation",
        "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80",
        "summary": "Stem cuttings, root divisions, and water rooting: a step-by-step masterclass on multiplying your collection.",
        "difficulty": "Easy",
        "light_req": "Gentle, bright indirect light",
        "water_req": "Fresh filtered water replaced weekly",
        "common_problems": [
            {"issue": "Stem cutting rot in water", "fix": "Ensure node isn't damaged, and replace water with fresh room-temp water weekly."},
            {"issue": "Transplant shock after potting", "fix": "Keep newly potted soil gently moist for the first 10 days."}
        ],
        "step_by_step": [
            "Identify an active node on a healthy parent stem.",
            "Cut 1/4 inch below the node with sterile razor or shears.",
            "Submerge the node in clean water, keeping leaves above water.",
            "Transplant into soil once roots reach 2 inches in length."
        ],
        "attribution": "FloraAI Botanical Guild",
        "content": (
            "Propagation is one of the most rewarding aspects of gardening. By identifying active nodes where meristematic cells "
            "reside, you can produce genetically identical vigorous offspring with zero specialized equipment."
        )
    },
    {
        "title": "Soil Science: Creating the Perfect Aroid & Potting Mix",
        "slug": "soil-science-perfect-potting-mix",
        "category": "Soil & Nutrition",
        "image_url": "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
        "summary": "Why commercial dirt chokes roots and how to blend chunky, aerated custom potting substrates.",
        "difficulty": "Medium",
        "light_req": "N/A",
        "water_req": "N/A",
        "common_problems": [
            {"issue": "Compacted, hydrophobic soil", "fix": "Aerate with a chopstick and amend with coarse perlite and orchid bark."},
            {"issue": "Fungus gnats breeding", "fix": "Soil is staying wet too long; replace dense peat with chunky bark and pumice."}
        ],
        "step_by_step": [
            "Combine 40% high quality coco coir or peat.",
            "Add 30% chunky pine or fir orchid bark.",
            "Add 20% coarse perlite or pumice for permanent aeration.",
            "Add 10% worm castings for gentle, organic bio-nutrients."
        ],
        "attribution": "Soil Science Society",
        "content": (
            "Houseplant roots require oxygen just as much as water. Dense bagged potting soil collapses over time, creating anoxic "
            "zones where pathogenic anaerobic bacteria thrive, causing root rot. A chunkier mix ensures oxygen reaches roots constantly."
        )
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed educational articles
        for art_data in ARTICLES_DATA:
            existing = db.query(Article).filter(Article.slug == art_data["slug"]).first()
            if not existing:
                article = Article(**art_data)
                db.add(article)

        # Seed default Demo User
        demo_email = "demo@floraai.com"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                hashed_password=get_password_hash("FloraPassword123!"),
                full_name="Botanical Explorer",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                preferred_language="en",
                timezone="UTC",
                theme="light",
                measurement_units="metric"
            )
            db.add(demo_user)
            db.flush()

            # Seed sample plants for demo user
            plant1 = Plant(
                user_id=demo_user.id,
                common_name="Monstera Deliciosa",
                scientific_name="Monstera deliciosa",
                category="Indoor",
                photo_url="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
                location="Living Room by Window",
                environment="indoor",
                health_status="healthy",
                care_preferences={
                    "light": "Bright indirect",
                    "watering_frequency_days": 7,
                    "fertilizing_frequency_days": 30,
                    "soil": "Chunky aroid mix",
                    "humidity": "60%",
                    "toxicity": "Toxic to pets"
                },
                notes="Growing 2 new leaves with lovely fenestrations!"
            )
            db.add(plant1)
            db.flush()

            plant2 = Plant(
                user_id=demo_user.id,
                common_name="Snake Plant Laurentii",
                scientific_name="Dracaena trifasciata",
                category="Succulent",
                photo_url="https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?auto=format&fit=crop&w=800&q=80",
                location="Bedroom Shelf",
                environment="indoor",
                health_status="healthy",
                care_preferences={
                    "light": "Low to bright indirect",
                    "watering_frequency_days": 18,
                    "fertilizing_frequency_days": 60,
                    "soil": "Gritty cactus mix",
                    "humidity": "40%",
                    "toxicity": "Mildly toxic"
                },
                notes="Thriving on minimal watering."
            )
            db.add(plant2)
            db.flush()

            plant3 = Plant(
                user_id=demo_user.id,
                common_name="Sweet Genovese Basil",
                scientific_name="Ocimum basilicum",
                category="Herb",
                photo_url="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80",
                location="Kitchen Windowsill",
                environment="indoor",
                health_status="needs_attention",
                care_preferences={
                    "light": "Full direct sunlight",
                    "watering_frequency_days": 3,
                    "fertilizing_frequency_days": 14,
                    "soil": "Rich organic loam",
                    "humidity": "50%",
                    "toxicity": "Safe for pets"
                },
                notes="A bit thirsty, pinch flower buds to maintain bushy growth."
            )
            db.add(plant3)
            db.flush()

            # Seed care reminders
            now = datetime.now(timezone.utc)
            rem1 = CareReminder(
                user_id=demo_user.id,
                plant_id=plant1.id,
                task_type="watering",
                title="Water Monstera Deliciosa",
                due_at=now + timedelta(hours=3),
                repeat_rule="weekly",
                repeat_days=7,
                notes="Check top 2 inches of soil first",
                status="pending"
            )
            db.add(rem1)

            rem2 = CareReminder(
                user_id=demo_user.id,
                plant_id=plant3.id,
                task_type="watering",
                title="Water Basil & Check Leaves",
                due_at=now - timedelta(hours=2),
                repeat_rule="every_3_days",
                repeat_days=3,
                notes="Soil dry to touch",
                status="overdue"
            )
            db.add(rem2)

            rem3 = CareReminder(
                user_id=demo_user.id,
                plant_id=plant2.id,
                task_type="fertilizing",
                title="Fertilize Snake Plant",
                due_at=now + timedelta(days=5),
                repeat_rule="monthly",
                repeat_days=30,
                notes="Dilute cactus fertilizer to half strength",
                status="pending"
            )
            db.add(rem3)

            # Growth records
            growth1 = GrowthRecord(
                user_id=demo_user.id,
                plant_id=plant1.id,
                height=45.0,
                measurement_unit="cm",
                leaf_count=6,
                health_status="healthy",
                observation="Two new fenestrated leaves opened up beautifully.",
                recorded_at=now - timedelta(days=14)
            )
            db.add(growth1)

            growth2 = GrowthRecord(
                user_id=demo_user.id,
                plant_id=plant1.id,
                height=52.0,
                measurement_unit="cm",
                leaf_count=7,
                health_status="healthy",
                observation="Main stem grew 7cm after adding moss pole.",
                recorded_at=now - timedelta(days=1)
            )
            db.add(growth2)

            # Care Log
            care_log1 = CareLog(
                user_id=demo_user.id,
                plant_id=plant1.id,
                action_type="watering",
                notes="Deep soak and drainage check",
                completed_at=now - timedelta(days=7)
            )
            db.add(care_log1)

            # Notifications
            notif1 = Notification(
                user_id=demo_user.id,
                plant_id=plant3.id,
                title="Care Reminder: Basil watering is due",
                message="Check soil moisture for Kitchen Basil and water thoroughly.",
                notification_type="care_due",
                created_at=now - timedelta(hours=1)
            )
            db.add(notif1)

        db.commit()
        print("FloraAI database successfully initialized and seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
