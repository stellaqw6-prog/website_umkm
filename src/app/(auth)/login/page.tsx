import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun UMKM Store Anda untuk mulai berbelanja dan mengelola pesanan.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
