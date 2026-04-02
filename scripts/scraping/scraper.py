#!/usr/bin/env python3
"""
CompeteScope Scraper: Obtiene URLs de competidores y detecta cambios
Usa: python scraper.py
"""

import os
import json
import hashlib
import asyncio
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
import httpx
from bs4 import BeautifulSoup
from supabase import create_client, Client

# Load env
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Init Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def scrape_url(url: str) -> str:
    """Scrape URL y retorna contenido en markdown"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script/style
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Get text
            text = soup.get_text()
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return text[:50000]  # Limita a 50k chars
    except Exception as e:
        print(f"❌ Error scraping {url}: {e}")
        return ""

def compute_hash(content: str) -> str:
    """SHA256 hash del contenido"""
    return hashlib.sha256(content.encode()).hexdigest()

def compute_diff(old_content: str, new_content: str) -> str:
    """Diff simple basado en similitud"""
    old_lines = list(old_content.split('\n')[:100])  # Primeras 100 líneas
    new_lines = list(new_content.split('\n')[:100])
    
    old_set = set(old_lines)
    new_set = set(new_lines)
    
    added = [line for line in new_lines if line not in old_set]
    removed = [line for line in old_lines if line not in new_set]
    
    diff = f"REMOVED:\n" + '\n'.join(removed[:10]) if removed else ""
    diff += f"\n\nADDED:\n" + '\n'.join(added[:10]) if added else ""
    
    return diff

async def process_competitor(competitor_id: str, url: str):
    """Scrape, detecta cambios y guarda snapshot"""
    print(f"🕷️  Scraping {url}...")
    
    # Scrape actual
    new_content = await scrape_url(url)
    if not new_content:
        print(f"  ⚠️  No content scraped")
        return
    
    new_hash = compute_hash(new_content)
    
    # Obtén último snapshot
    try:
        response = supabase.table("competitor_snapshots") \
            .select("*") \
            .eq("competitor_id", competitor_id) \
            .order("scraped_at", desc=True) \
            .limit(1) \
            .execute()
        
        old_snapshot = response.data[0] if response.data else None
    except Exception as e:
        print(f"  ⚠️  Error fetching old snapshot: {e}")
        old_snapshot = None
    
    # Calcula diff
    diff_text = ""
    if old_snapshot:
        if old_snapshot["content_hash"] != new_hash:
            diff_text = compute_diff(old_snapshot["raw_content"], new_content)
            print(f"  ✅ CAMBIOS DETECTADOS!")
        else:
            print(f"  → Sin cambios")
    else:
        print(f"  ✅ Primer scrape guardado")
    
    # Guarda snapshot
    try:
        supabase.table("competitor_snapshots").insert({
            "competitor_id": competitor_id,
            "content_hash": new_hash,
            "raw_content": new_content[:10000],  # Limita a 10k
            "diff_text": diff_text,
            "scraped_at": datetime.utcnow().isoformat()
        }).execute()
        print(f"  ✓ Guardado en Supabase")
    except Exception as e:
        print(f"  ❌ Error saving: {e}")

async def main():
    print("=" * 50)
    print("CompeteScope Scraper")
    print("=" * 50)
    
    try:
        # Obtén todos los competidores
        response = supabase.table("competitors").select("*").execute()
        competitors = response.data
        
        if not competitors:
            print("⚠️  No competitors found. Add some in the dashboard first.")
            return
        
        print(f"📊 Found {len(competitors)} competitors\n")
        
        # Scrape todos
        tasks = [
            process_competitor(c["id"], c["homepage_url"]) 
            for c in competitors
        ]
        
        await asyncio.gather(*tasks)
        
        print("\n" + "=" * 50)
        print("✅ Scraping completado!")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Fatal error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
