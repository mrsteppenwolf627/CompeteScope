#!/usr/bin/env python3
"""Demo scraper sin dependencias Supabase para testing OpenAI"""

import json
import os
import tempfile
from datetime import datetime
import hashlib

# Mock data
mock_competitors = [
    {
        "id": "comp-1",
        "name": "Stripe",
        "url": "https://stripe.com",
        "old_content": "Stripe | Payment Processing API",
        "new_content": "Stripe | Payment Processing API\nNEW: Stripe Radar AI fraud detection released 2025"
    },
    {
        "id": "comp-2", 
        "name": "Notion",
        "url": "https://notion.so",
        "old_content": "Notion | Your workspace, your way",
        "new_content": "Notion | Your workspace, your way\nNEW: AI Assistant pricing updated to $8/mo"
    }
]

def compute_hash(content):
    return hashlib.sha256(content.encode()).hexdigest()

def compute_diff(old, new):
    old_lines = set(old.split('\n'))
    new_lines = set(new.split('\n'))
    added = new_lines - old_lines
    removed = old_lines - new_lines
    return f"REMOVED:\n{chr(10).join(list(removed)[:3])}\n\nADDED:\n{chr(10).join(list(added)[:3])}"

# Generate mock snapshots
snapshots = []
for comp in mock_competitors:
    diff = compute_diff(comp["old_content"], comp["new_content"])
    snapshot = {
        "id": f"snap-{comp['id']}",
        "competitor_id": comp["id"],
        "name": comp["name"],
        "content_hash": compute_hash(comp["new_content"]),
        "raw_content": comp["new_content"],
        "diff_text": diff,
        "scraped_at": datetime.utcnow().isoformat()
    }
    snapshots.append(snapshot)
    print(f"\n{'='*50}")
    print(f"📊 {comp['name']}")
    print(f"{'='*50}")
    print(f"Diff detected:\n{diff}")
    print(f"\nSnapshot saved")

print(f"\n{'='*50}")
print(f"✅ Mock scraping complete! {len(snapshots)} snapshots")
print(f"{'='*50}")

# Save para usar con OpenAI
output_path = os.path.join(tempfile.gettempdir(), 'mock_snapshots.json')
with open(output_path, 'w') as f:
    json.dump(snapshots, f, indent=2)

print(f"\n✅ Saved to {output_path}")
