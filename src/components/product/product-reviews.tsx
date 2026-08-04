"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import toast from "react-hot-toast";

interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  userName: string | null;
}

export function ProductReviews({ productId, productSlug }: { productId: number; productSlug: string }) {
  const { user } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [distribution, setDistribution] = useState<{ star: number; count: number }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`/api/products/${productSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews ?? []);
        setDistribution(data.distribution ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, [productSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengirim ulasan");
        return;
      }
      toast.success("Terima kasih atas ulasannya!");
      setShowForm(false);
      setContent("");
      setRating(5);
      load();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="mt-16 border-t border-gray-100 pt-10 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ulasan Pembeli ({total})</h2>
        {user && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            <MessageSquare size={15} className="mr-1.5" /> Tulis Ulasan
          </Button>
        )}
      </div>

      {!user && (
        <p className="text-sm text-gray-500 mb-6 dark:text-gray-400">
          <Link href={`/login?redirect=/produk/${productSlug}`} className="text-blue-600 hover:underline font-medium">Login</Link> untuk memberi ulasan produk ini.
        </p>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-4 dark:bg-gray-900"
        >
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block dark:text-gray-300">Rating Kamu</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)}>
                  <Star size={26} className={r <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block dark:text-gray-300">Ulasan Kamu</label>
            <Textarea required rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ceritakan pengalaman kamu dengan produk ini..." />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
            <Button type="submit" variant="premium" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Kirim Ulasan"}
            </Button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="flex justify-center py-10 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={24} /></div>
      ) : total === 0 ? (
        <p className="text-gray-400 text-sm py-6 dark:text-gray-500">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
      ) : (
        <>
          {/* Distribution bar */}
          <div className="space-y-1.5 mb-8 max-w-sm">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-500 dark:text-gray-400">{d.star} ★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 text-gray-400 text-right dark:text-gray-500">{d.count}</span>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(r.userName ?? "P").charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{r.userName ?? "Pembeli"}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                      <span className="text-xs text-gray-400 ml-1.5 dark:text-gray-500">{new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">{r.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
