import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string, siteName: string) {
  if (!resend) {
    // Belum ada RESEND_API_KEY di .env — tampilkan link di log server sebagai fallback
    // supaya fitur tetap bisa dites/dipakai sebelum email beneran disambungkan.
    console.log(`\n📧 [EMAIL FALLBACK] Link reset password untuk ${to}:\n${resetUrl}\n`);
    return { sent: false, reason: "no_api_key" as const };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `Reset Password - ${siteName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Reset Password Anda</h2>
          <p>Kami menerima permintaan untuk mereset password akun ${siteName} Anda.</p>
          <p>Klik tombol di bawah untuk membuat password baru. Link ini berlaku selama 1 jam.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">Reset Password</a>
          <p style="color:#6b7280;font-size:13px;">Kalau kamu tidak meminta ini, abaikan saja email ini.</p>
        </div>
      `,
    });
    return { sent: true as const };
  } catch (err) {
    console.error("Send email error:", err);
    console.log(`\n📧 [EMAIL FALLBACK] Link reset password untuk ${to}:\n${resetUrl}\n`);
    return { sent: false, reason: "send_failed" as const };
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: { orderNumber: string; customerName: string; items: { name: string; quantity: number; price: number }[]; grandTotal: number; siteName: string; orderUrl: string }
) {
  const formatRupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
  const itemsHtml = data.items
    .map((i) => `<tr><td style="padding:6px 0;">${i.name} x${i.quantity}</td><td style="padding:6px 0;text-align:right;">${formatRupiah(i.price * i.quantity)}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Pesanan Diterima! 🎉</h2>
      <p>Halo ${data.customerName}, terima kasih sudah berbelanja di ${data.siteName}.</p>
      <p>Nomor pesanan: <strong>${data.orderNumber}</strong></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}</table>
      <p style="font-size:16px;"><strong>Total: ${formatRupiah(data.grandTotal)}</strong></p>
      <a href="${data.orderUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">Lihat Detail Pesanan</a>
      <p style="color:#6b7280;font-size:13px;">Kami akan segera memproses pesananmu. Terima kasih!</p>
    </div>
  `;

  if (!resend) {
    console.log(`\n📧 [EMAIL FALLBACK] Konfirmasi pesanan ${data.orderNumber} untuk ${to} (Resend belum dikonfigurasi)\n`);
    return { sent: false as const };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `Pesanan ${data.orderNumber} Diterima - ${data.siteName}`,
      html,
    });
    return { sent: true as const };
  } catch (err) {
    console.error("Send order email error:", err);
    return { sent: false as const };
  }
}
