interface DigestData {
  userName: string;
  totalScans: number;
  uniqueTags: number;
  mostActiveTag: string | null;
  topTags: Array<{ name: string; count: number }>;
  appUrl: string;
}

export function buildWeeklyDigestHtml(data: DigestData): string {
  const { userName, totalScans, uniqueTags, mostActiveTag, topTags, appUrl } = data;

  const topTagsHtml = topTags.length
    ? topTags
        .map(
          (t, i) =>
            `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #666;">#${i + 1}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(t.name)}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${t.count}</td>
            </tr>`
        )
        .join('')
    : '<tr><td colspan="3" style="padding: 12px; color: #999; text-align: center;">No tag activity this week</td></tr>';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Starter App Weekly Summary</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #111827; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">Starter App</h1>
              <p style="margin: 4px 0 0; color: #9ca3af; font-size: 13px;">Your Weekly Summary</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <p style="margin: 0; color: #374151; font-size: 15px;">Hi ${escapeHtml(userName)},</p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Here&rsquo;s your scan activity for the past week.</p>
            </td>
          </tr>

          <!-- Stats -->
          <tr>
            <td style="padding: 16px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 28px; font-weight: 700; color: #111827;">${totalScans}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Total Scans</div>
                  </td>
                  <td width="12"></td>
                  <td style="text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 28px; font-weight: 700; color: #111827;">${uniqueTags}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Unique Tags</div>
                  </td>
                  <td width="12"></td>
                  <td style="text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="font-size: 14px; font-weight: 600; color: #111827;">${escapeHtml(mostActiveTag || '—')}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Most Active</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Top Tags -->
          <tr>
            <td style="padding: 8px 32px 24px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #374151;">Top Tags</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f9fafb;">
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 500;">Rank</th>
                    <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #6b7280; font-weight: 500;">Tag</th>
                    <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #6b7280; font-weight: 500;">Scans</th>
                  </tr>
                </thead>
                <tbody>
                  ${topTagsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 32px; background-color: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">View Dashboard</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                You&rsquo;re receiving this because you enabled weekly digest emails.
                <a href="${appUrl}/settings?tab=notifications" style="color: #6b7280;">Manage preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
