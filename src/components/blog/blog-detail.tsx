import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
  title: string;
  content: string;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | string | null;
}

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export function BlogDetail({ post }: { post: Post }) {
  const readTime = Math.max(1, Math.round(post.content.length / 1000));

  return (
    <article className="bg-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={15} /> Kembali ke Blog
        </Link>

        {post.category && <Badge className="mb-4">{post.category}</Badge>}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-8">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.publishedAt)}</span>
          <span className="flex items-center gap-1.5"><Clock size={14} /> {readTime} min baca</span>
        </div>

        {post.coverImage && (
          <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
          {post.content}
        </div>
      </div>
    </article>
  );
}
