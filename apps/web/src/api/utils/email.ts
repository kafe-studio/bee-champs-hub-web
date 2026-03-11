/**
 * Resend email utility — odesilani emailu pres Resend API
 */
import { Effect, Data, Schema } from "effect"

export class EmailSendError extends Data.TaggedError("EmailSendError")<{
  readonly message: string
  readonly cause?: unknown
}> {}

const ResendResponse = Schema.Struct({ id: Schema.String })

export const sendEmail = (params: {
  readonly apiKey: string
  readonly from: string
  readonly to: string | readonly string[]
  readonly subject: string
  readonly html: string
}): Effect.Effect<string, EmailSendError> =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${params.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: params.from,
            to: Array.isArray(params.to) ? params.to : [params.to],
            subject: params.subject,
            html: params.html,
          }),
        }),
      catch: (cause) => new EmailSendError({ message: "Resend request selhal", cause }),
    })

    if (!response.ok) {
      const text = yield* Effect.tryPromise({
        try: () => response.text(),
        catch: () => new EmailSendError({ message: `Resend vratil ${response.status}` }),
      })
      return yield* Effect.fail(new EmailSendError({ message: `Resend ${response.status}: ${text}` }))
    }

    const json = yield* Effect.tryPromise({
      try: () => response.json() as Promise<unknown>,
      catch: (cause) => new EmailSendError({ message: "Parsovani selhalo", cause }),
    })

    const decodeResend = Schema.decodeUnknown(ResendResponse)
    const decoded = decodeResend(json)
    const result = yield* Effect.mapError(
      decoded,
      () => new EmailSendError({ message: "Neplatna odpoved z Resend" }),
    )

    return result.id
  })

// Email notifikace pri nove poptavce
const schoolTypeLabels: Record<string, string> = {
  ms: "Mateřská škola",
  zs: "Základní škola",
  ss: "Střední škola",
  other: "Jiné",
}

const gymLabels: Record<string, string> = {
  yes: "Ano",
  no: "Ne",
  external: "Externí",
}

const playgroundLabels: Record<string, string> = {
  yes: "Ano",
  no: "Ne",
}

export const sendInquiryNotification = (params: {
  readonly apiKey: string
  readonly to: string | readonly string[]
  readonly schoolName: string
  readonly schoolType: string
  readonly contactName: string
  readonly contactEmail: string
  readonly contactPhone: string
  readonly contactPosition: string
  readonly city: string
  readonly childrenCount: number
  readonly ageRange: string
  readonly hasGym: string
  readonly hasPlayground: string
  readonly notes: string
  readonly programCount: number
  readonly programs: readonly { name: string; month: string }[]
  readonly appUrl: string
}): Effect.Effect<string, EmailSendError> => {
  const programRows = params.programs.length > 0
    ? params.programs.map(p => `
        <tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px;">${p.name}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #64748B;">${p.month}</td>
        </tr>`).join("")
    : `<tr><td colspan="2" style="padding: 12px; color: #94A3B8; font-style: italic;">Bez konkrétních programů</td></tr>`

  return sendEmail({
    apiKey: params.apiKey,
    from: "Bee Champs Hub <noreply@pefen.dev>",
    to: params.to,
    subject: `Nová poptávka — ${params.schoolName} (${params.city})`,
    html: `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'DM Sans', sans-serif;">
  <div style="max-width: 620px; margin: 0 auto; padding: 24px 16px;">
    <div style="background: linear-gradient(135deg, #0D1B2E 0%, #1A2D47 100%); padding: 28px 32px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: #F5A623; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Bee Champs Hub</h1>
      <p style="color: #94A3B8; margin: 4px 0 0; font-size: 13px;">Nová poptávka ze školního plánovače</p>
    </div>
    <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-top: none; padding: 32px; border-radius: 0 0 16px 16px;">
      <div style="margin-bottom: 24px;">
        <h2 style="color: #0D1B2E; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Informace o škole</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px; width: 140px;">Název školy</td><td style="padding: 8px 0; font-weight: 600; font-size: 14px; color: #0F172A;">${params.schoolName}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Typ</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${schoolTypeLabels[params.schoolType] ?? params.schoolType}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Město</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${params.city}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Počet dětí</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${params.childrenCount}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Věkové rozmezí</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${params.ageRange}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Tělocvična</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${(gymLabels[params.hasGym] ?? params.hasGym) || "—"}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748B; font-size: 14px;">Hřiště</td><td style="padding: 8px 0; font-size: 14px; color: #0F172A;">${(playgroundLabels[params.hasPlayground] ?? params.hasPlayground) || "—"}</td></tr>
        </table>
      </div>
      <div style="margin-bottom: 24px; padding: 20px; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0;">
        <h2 style="color: #0D1B2E; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Kontaktní osoba</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; width: 140px;">Jméno</td><td style="padding: 6px 0; font-weight: 600; font-size: 14px; color: #0F172A;">${params.contactName}</td></tr>
          ${params.contactPosition ? `<tr><td style="padding: 6px 0; color: #64748B; font-size: 14px;">Pozice</td><td style="padding: 6px 0; font-size: 14px; color: #0F172A;">${params.contactPosition}</td></tr>` : ""}
          <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px;">E-mail</td><td style="padding: 6px 0; font-size: 14px;"><a href="mailto:${params.contactEmail}" style="color: #3B82F6; text-decoration: none;">${params.contactEmail}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px;">Telefon</td><td style="padding: 6px 0; font-size: 14px;"><a href="tel:${params.contactPhone}" style="color: #3B82F6; text-decoration: none;">${params.contactPhone}</a></td></tr>
        </table>
      </div>
      <div style="margin-bottom: 24px;">
        <h2 style="color: #0D1B2E; margin: 0 0 12px; font-size: 16px; font-weight: 700;">Vybrané programy (${params.programCount})</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #E2E8F0; border-radius: 8px;">
          <thead><tr style="background: #F8FAFC;"><th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0;">Program</th><th style="padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0;">Měsíc</th></tr></thead>
          <tbody>${programRows}</tbody>
        </table>
      </div>
      ${params.notes ? `<div style="margin-bottom: 24px; padding: 16px; background: #FFFBEB; border-radius: 8px; border: 1px solid #FEF3C7;"><p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #92400E; text-transform: uppercase; letter-spacing: 0.05em;">Poznámky</p><p style="margin: 0; font-size: 14px; color: #451A03; line-height: 1.5;">${params.notes}</p></div>` : ""}
      <div style="text-align: center; margin-top: 28px;">
        <a href="${params.appUrl}/admin" style="background: linear-gradient(135deg, #F5A623 0%, #E09800 100%); color: #0D1B2E; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 2px 8px rgba(245,166,35,0.3);">Zobrazit v administraci →</a>
      </div>
    </div>
    <div style="text-align: center; padding: 20px 0 0;">
      <p style="color: #94A3B8; font-size: 12px; margin: 0;">Tento e-mail byl automaticky odeslán z <a href="${params.appUrl}" style="color: #64748B;">Bee Champs Hub</a></p>
    </div>
  </div>
</body>
</html>`,
  })
}
