"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { testimonials as testimonialsTable } from "@/db/schema";

type Testimonial = typeof testimonialsTable.$inferSelect;

const colors = [
  "from-pink-500 to-rose-500",
  "from-blue-500 to-indigo-500",
  "from-green-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-orange-500 to-red-500",
  "from-cyan-500 to-blue-500",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-stone-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Testimoni
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 dark:text-stone-100">
            Apa Kata Mereka?
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto dark:text-stone-400">
            Ribuan pelanggan telah mempercayakan kebutuhan mereka kepada UMKM Store
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gray-50 rounded-2xl p-6 relative group hover:shadow-lg transition-all dark:bg-stone-900 dark:hover:shadow-black/40"
            >
              <Quote className="absolute top-4 right-4 text-gray-200 w-10 h-10 group-hover:text-blue-100 transition-colors dark:text-stone-800 dark:group-hover:text-blue-950" />
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className={j < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-stone-700"}
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 dark:text-stone-400">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3 border-t border-gray-200 pt-4 dark:border-stone-800">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                >
                  {initials(testimonial.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm dark:text-stone-100">{testimonial.name}</p>
                  <p className="text-xs text-gray-400 dark:text-stone-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
