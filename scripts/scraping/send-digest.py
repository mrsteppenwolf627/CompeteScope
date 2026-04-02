#!/usr/bin/env python3
"""
CompeteScope Email Digest: Genera y envía digest semanal
Usa: python send-digest.py [project_id] [user_email]
"""

import os
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
RESEND_API_KEY = os.getenv("RESEND_API_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def send_email_digest(project_id: str, user_email: str):
    """Obtén análisis de esta semana y arma HTML"""
    
    print(f"📧 Generando digest para {project_id}...")
    
    # Obtén snapshots de esta semana
    one_week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
    
    try:
        # Note: The query joins with competitors. Ensure your Supabase schema allows this join.
        response = supabase.table("competitor_snapshots") \
            .select("""
                id, ai_analysis, scraped_at,
                competitors(id, name, homepage_url)
            """) \
            .gte("scraped_at", one_week_ago) \
            .execute()
        
        snapshots = response.data
    except Exception as e:
        print(f"❌ Error fetching snapshots: {e}")
        return False
    
    if not snapshots:
        print("⚠️  No updates this week")
        return False
    
    # Arma HTML
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1e40af 0%, #0f172a 100%); color: white; padding: 20px; border-radius: 8px; }}
            .competitor {{ border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 6px; }}
            .what-changed {{ font-weight: bold; color: #1e40af; }}
            .footer {{ color: #666; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 CompeteScope Weekly Digest</h1>
                <p>Here's what your competitors did this week</p>
            </div>
    """
    
    for snap in snapshots:
        comp = snap.get("competitors", {})
        comp_name = comp.get("name", "Unknown") if isinstance(comp, dict) else "Unknown"
        analysis = snap.get("ai_analysis", "No analysis yet")
        date = snap.get("scraped_at", "")
        
        html += f"""
            <div class="competitor">
                <h3>{comp_name}</h3>
                <p><strong>Updated:</strong> {date[:10]}</p>
                <div class="what-changed">{analysis}</div>
            </div>
        """
    
    html += """
            <div class="footer">
                <p>CompeteScope - Keep track of your competition</p>
                <p><a href="https://competescope.app">Dashboard</a> | <a href="https://competescope.app/settings">Preferences</a></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    print(f"✅ HTML generado ({len(snapshots)} updates)")
    
    # Save digest locally (using a path compatible with your OS)
    filename = f'digest_{project_id}_{datetime.now().strftime("%Y%m%d")}.html'
    output_path = os.path.join(os.getcwd(), filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✅ Digest guardado en: {output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python send-digest.py [project_id] [user_email]")
        sys.exit(1)
    
    project_id = sys.argv[1]
    user_email = sys.argv[2]
    
    send_email_digest(project_id, user_email)
