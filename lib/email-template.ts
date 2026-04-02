interface AnalysisData {
  what_changed: string
  implication: string
  your_action: string
}

interface Snapshot {
  id: string
  competitor_id: string
  scraped_at: string
  ai_analysis: AnalysisData | string
  competitors: {
    id: string
    name: string
    homepage_url: string
    projects: { id: string; name: string }
  }
}

function parseAnalysis(ai_analysis: AnalysisData | string): AnalysisData | null {
  if (!ai_analysis) return null
  if (typeof ai_analysis === 'string') {
    try {
      return JSON.parse(ai_analysis) as AnalysisData
    } catch {
      return null
    }
  }
  return ai_analysis
}

export function generateDigestEmail(userEmail: string, snapshots: Snapshot[]): string {
  // Group by project name, deduplicate by competitor (keep latest per competitor)
  const byProject: Record<string, Snapshot[]> = {}

  for (const snap of snapshots) {
    const projectName = snap.competitors?.projects?.name
    if (!projectName) continue
    if (!byProject[projectName]) byProject[projectName] = []

    // Keep only latest snapshot per competitor within this project
    const existing = byProject[projectName].findIndex(
      (s) => s.competitor_id === snap.competitor_id
    )
    if (existing === -1) {
      byProject[projectName].push(snap)
    } else if (new Date(snap.scraped_at) > new Date(byProject[projectName][existing].scraped_at)) {
      byProject[projectName][existing] = snap
    }
  }

  const totalChanges = Object.values(byProject).flat().length
  const projectCount = Object.keys(byProject).length

  const projectsHtml = Object.entries(byProject)
    .map(([projectName, projectSnapshots]) => {
      const changesHtml = projectSnapshots
        .map((snap) => {
          const analysis = parseAnalysis(snap.ai_analysis)
          if (!analysis) return ''

          const date = new Date(snap.scraped_at).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })

          return `
            <div style="margin-bottom: 20px; padding: 20px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <h4 style="margin: 0; color: #1e293b; font-size: 16px;">${snap.competitors.name}</h4>
                <span style="font-size: 11px; color: #94a3b8; white-space: nowrap; margin-left: 12px;">${date}</span>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; vertical-align: top; width: 140px;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">What Changed</span>
                  </td>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <p style="margin: 0; color: #334155; font-size: 14px;">${analysis.what_changed}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Implication</span>
                  </td>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <p style="margin: 0; color: #334155; font-size: 14px;">${analysis.implication}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #f59e0b;">Your Action</span>
                  </td>
                  <td style="padding: 8px 0; vertical-align: top;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">${analysis.your_action}</p>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 12px;">
                <a href="${snap.competitors.homepage_url}" target="_blank"
                   style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                  Visit ${snap.competitors.name} →
                </a>
              </div>
            </div>
          `
        })
        .filter(Boolean)
        .join('')

      if (!changesHtml) return ''

      return `
        <div style="margin-bottom: 30px;">
          <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            ${projectName}
          </h3>
          ${changesHtml}
        </div>
      `
    })
    .filter(Boolean)
    .join('')

  const summaryLine =
    totalChanges === 1
      ? `<strong>1 change</strong> detected across <strong>${projectCount} project${projectCount > 1 ? 's' : ''}</strong>`
      : `<strong>${totalChanges} changes</strong> detected across <strong>${projectCount} project${projectCount > 1 ? 's' : ''}</strong>`

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CompeteScope Weekly Digest</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155;">

        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); border-radius: 12px 12px 0 0; padding: 32px 40px; text-align: center;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px;">Weekly Report</p>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">📊 CompeteScope</h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: #bfdbfe;">Your competitive intelligence digest</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="background-color: #ffffff; padding: 40px;">

                    <p style="margin: 0 0 8px 0; color: #475569; font-size: 15px;">Hi there,</p>
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px;">
                      Here's your weekly competitive intelligence report. ${summaryLine} in the last 7 days.
                    </p>

                    ${projectsHtml}

                    <!-- CTA -->
                    <div style="text-align: center; margin: 32px 0 0 0;">
                      <a href="http://localhost:3000/dashboard"
                         style="display: inline-block; background-color: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 8px;">
                        View full analysis in dashboard →
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-radius: 0 0 12px 12px; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;">
                      CompeteScope · AI-powered competitive intelligence for micro-SaaS founders
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                      <a href="http://localhost:3000/unsubscribe?email=${encodeURIComponent(userEmail)}"
                         style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a>
                      &nbsp;·&nbsp;
                      <a href="http://localhost:3000/dashboard"
                         style="color: #94a3b8; text-decoration: underline;">Dashboard</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
    </html>
  `
}
