import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { name, organization, email, message } = await request.json()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)

  if (adminEmails.length === 0) {
    return NextResponse.json({ error: 'No admin emails configured' }, { status: 500 })
  }

  const { error } = await resend.emails.send({
    from: 'VolunTrack Ontario <onboarding@resend.dev>',
    to: adminEmails,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 140px;">Name</td>
            <td style="padding: 8px 0; color: #111;">${name}</td>
          </tr>
          ${organization ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Organization</td>
            <td style="padding: 8px 0; color: #111;">${organization}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
            <td style="padding: 8px 0; color: #111;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Message</td>
            <td style="padding: 8px 0; color: #111; white-space: pre-wrap;">${message}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Sent via the VolunTrack Ontario contact form</p>
      </div>
    `,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
