const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

interface ImgBBResponse {
  data?: { url: string; display_url: string };
  success: boolean;
  error?: { message: string };
}

export async function uploadImageToImgBB(base64Image: string): Promise<{ url: string } | { error: string }> {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    return { error: "Upload gambar belum dikonfigurasi. Hubungi admin (IMGBB_API_KEY belum diisi)." };
  }

  try {
    const form = new FormData();
    form.append("key", apiKey);
    form.append("image", base64Image);

    const res = await fetch(IMGBB_UPLOAD_URL, { method: "POST", body: form });
    const data: ImgBBResponse = await res.json();

    if (!data.success || !data.data) {
      return { error: data.error?.message ?? "Gagal mengunggah gambar ke ImgBB" };
    }

    return { url: data.data.url };
  } catch (err) {
    console.error("ImgBB upload error:", err);
    return { error: "Gagal terhubung ke layanan upload gambar" };
  }
}
