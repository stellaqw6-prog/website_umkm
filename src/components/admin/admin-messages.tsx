"use client";

import { useEffect, useState } from "react";
import { Search, Mail, MailOpen, Trash2, Loader2, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);

  const load = () => {
    fetch("/api/admin/messages")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages ?? []);
        if (data.messages?.length > 0) setSelected((prev) => prev ?? data.messages[0]);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openMessage = async (msg: Message) => {
    setSelected(msg);
    if (!msg.isRead) {
      await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)));
    }
  };

  const handleDelete = async (msg: Message) => {
    if (!confirm("Hapus pesan ini?")) return;
    const res = await fetch(`/api/admin/messages/${msg.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus pesan");
      return;
    }
    toast.success("Pesan dihapus");
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (selected?.id === msg.id) setSelected(null);
  };

  const filtered = messages.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Pesan</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Pesan masuk dari formulir kontak pelanggan</p>
      </div>

      {messages.length === 0 ? (
        <Card>
          <div className="py-20 flex flex-col items-center justify-center text-center text-gray-400 dark:text-stone-500">
            <Inbox size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Belum ada pesan masuk.</p>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-2 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-stone-800">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
                <Input placeholder="Cari pesan..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  className={cn("w-full text-left p-4 hover:bg-gray-50/50 dark:hover:bg-stone-800/50 transition-colors", selected?.id === msg.id && "bg-blue-50/50 dark:bg-blue-950/30")}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn("text-sm", !msg.isRead ? "font-bold text-gray-900 dark:text-stone-100" : "font-medium text-gray-700 dark:text-stone-300")}>{msg.name}</span>
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                  </div>
                  <p className={cn("text-xs mb-1 truncate", !msg.isRead ? "font-semibold text-gray-800 dark:text-stone-200" : "text-gray-500 dark:text-stone-400")}>{msg.subject}</p>
                  <p className="text-xs text-gray-400 truncate dark:text-stone-500">{msg.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 dark:text-stone-500">{new Date(msg.createdAt).toLocaleString("id-ID")}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-3">
            {selected ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-stone-100">{selected.subject}</h2>
                    <p className="text-sm text-gray-500 mt-1 dark:text-stone-400">
                      Dari <span className="font-medium text-gray-700 dark:text-stone-300">{selected.name}</span> ({selected.email})
                      {selected.phone && ` · ${selected.phone}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 dark:text-stone-500">{new Date(selected.createdAt).toLocaleString("id-ID")}</p>
                  </div>
                  <Badge variant={selected.isRead ? "secondary" : "default"} className="text-[10px] flex items-center gap-1 flex-shrink-0">
                    {selected.isRead ? <MailOpen size={11} /> : <Mail size={11} />} {selected.isRead ? "Dibaca" : "Baru"}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed mb-5 dark:bg-stone-800/60 dark:text-stone-400">{selected.message}</div>

                <div className="flex items-center gap-2">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}>
                    <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all">Balas via Email</button>
                  </a>
                  <button onClick={() => handleDelete(selected)} className="px-4 py-2 rounded-xl border border-gray-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-all flex items-center gap-1.5 dark:border-stone-700">
                    <Trash2 size={14} /> Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-20 flex items-center justify-center text-gray-400 text-sm dark:text-stone-500">Pilih pesan untuk melihat detail</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
