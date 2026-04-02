#!/usr/bin/env python3
"""Setup demo data en Supabase"""

import os
from uuid import uuid4
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Usa un user_id fijo para testing (en producción usarías auth real)
# Note: Ensure this UUID format is acceptable by your DB constraints
DEMO_USER_ID = "00000000-0000-0000-0000-000000000000"

try:
    # 1. Crea un proyecto demo
    project = supabase.table("projects").insert({
        "id": str(uuid4()),
        "user_id": DEMO_USER_ID,
        "name": "Tech SaaS Competitors",
        "description": "Monitoring major SaaS competitors"
    }).execute()
    
    project_id = project.data[0]["id"]
    print(f"✅ Project created: {project_id}")
    
    # 2. Agrega competidores
    competitors_data = [
        {
            "id": str(uuid4()),
            "project_id": project_id,
            "name": "Stripe",
            "homepage_url": "https://stripe.com",
            "pricing_url": "https://stripe.com/pricing",
            "category": "Payment"
        },
        {
            "id": str(uuid4()),
            "project_id": project_id,
            "name": "Notion",
            "homepage_url": "https://notion.so",
            "pricing_url": "https://notion.so/pricing",
            "category": "Productivity"
        },
        {
            "id": str(uuid4()),
            "project_id": project_id,
            "name": "Linear",
            "homepage_url": "https://linear.app",
            "pricing_url": "https://linear.app/pricing",
            "category": "Project Management"
        }
    ]
    
    supabase.table("competitors").insert(competitors_data).execute()
    print(f"✅ Added {len(competitors_data)} competitors")
    
    print("\n" + "="*50)
    print("Demo setup complete!")
    print(f"Project ID for testing: {project_id}")
    print("="*50)
    
except Exception as e:
    print(f"❌ Error: {e}")
