import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun baru di UMKM Store dan mulai berbelanja produk UMKM berkualitas.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-8 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
      <RegisterForm />
    </div>
  );
}
