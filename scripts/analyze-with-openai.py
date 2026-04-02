#!/usr/bin/env python3
"""Test OpenAI analysis con datos mock"""

import json
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

# Load .env.local from project root
root = Path(__file__).parent.parent
load_dotenv(root / ".env.local")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Load mock snapshots — look next to this script first, then /tmp fallback
snapshots_path = Path(__file__).parent / "mock_snapshots.json"
if not snapshots_path.exists():
    snapshots_path = Path("/tmp/mock_snapshots.json")

if not snapshots_path.exists():
    print("ERROR: mock_snapshots.json not found", file=sys.stderr)
    sys.exit(1)

with open(snapshots_path) as f:
    snapshots = json.load(f)

print("=" * 60)
print("  CompeteScope OpenAI Analysis")
print("=" * 60)

for snap in snapshots:
    print(f"\nAnalyzing: {snap['name']}")
    print(f"Diff:\n{snap['diff_text']}\n")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "You are a product strategy advisor for early-stage SaaS founders. Always respond with valid JSON.",
            },
            {
                "role": "user",
                "content": f"""Analyze this competitor update and provide:
1. WHAT CHANGED (1-2 sentences, be specific)
2. STRATEGIC IMPLICATION (how this affects the market)
3. ACTION ITEM (1-2 things the founder should do about it)

Competitor Update Diff:
{snap['diff_text']}

Format your response as JSON:
{{
  "what_changed": "...",
  "implication": "...",
  "action": "..."
}}""",
            },
        ],
        max_tokens=300,
    )

    analysis_text = response.choices[0].message.content

    try:
        analysis = json.loads(analysis_text)
        print(f"WHAT CHANGED:\n  {analysis['what_changed']}\n")
        print(f"IMPLICATION:\n  {analysis['implication']}\n")
        print(f"ACTION:\n  {analysis['action']}\n")
    except json.JSONDecodeError:
        print(f"Analysis:\n{analysis_text}\n")

    print("-" * 60)

print("\nAnalysis complete!")
