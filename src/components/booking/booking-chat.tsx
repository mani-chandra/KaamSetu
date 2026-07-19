"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { formatDate } from "@/lib/utils";

type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
  };
};

export function BookingChat({
  bookingId,
  currentUserId,
  enabled,
  otherPartyName,
  otherPartyImage,
  viewerRole,
}: {
  bookingId: string;
  currentUserId: string;
  enabled: boolean;
  otherPartyName?: string | null;
  otherPartyImage?: string | null;
  viewerRole: "customer" | "professional";
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const scrollChatToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.bookingChat.loadError);
        return;
      }
      setMessages(data.messages || []);
      setError("");
    } catch {
      setError(t.bookingChat.loadError);
    } finally {
      setLoading(false);
    }
  }, [bookingId, enabled, t.bookingChat.loadError]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [enabled, loadMessages]);

  useEffect(() => {
    if (loading || !enabled || messages.length === 0) return;
    scrollChatToBottom("auto");
  }, [loading, enabled, messages, scrollChatToBottom]);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending || !enabled) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.bookingChat.sendError);
        return;
      }
      setMessages((prev) => {
        const next = [...prev, data.message];
        requestAnimationFrame(() => scrollChatToBottom("smooth"));
        return next;
      });
      setBody("");
    } catch {
      setError(t.bookingChat.sendError);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const title =
    viewerRole === "customer"
      ? t.bookingChat.withProfessional
      : t.bookingChat.withCustomer;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {otherPartyName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {otherPartyImage ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={otherPartyImage}
                  alt={otherPartyName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                {otherPartyName.charAt(0)}
              </div>
            )}
            <span>{otherPartyName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!enabled ? (
          <p className="text-sm text-muted-foreground">{t.bookingChat.unavailable}</p>
        ) : (
          <>
            <div
              ref={listRef}
              className="max-h-72 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/40 p-3"
            >
              {loading ? (
                <p className="text-sm text-muted-foreground">{t.common.loading}</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t.bookingChat.empty}</p>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender.id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          isMine
                            ? "bg-brand text-white rounded-br-md"
                            : "bg-card text-card-foreground border border-border rounded-bl-md"
                        }`}
                      >
                        {!isMine && (
                          <p className="mb-1 text-xs font-medium opacity-80">
                            {message.sender.name ?? t.bookingChat.otherParty}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{message.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          {formatDate(new Date(message.createdAt))}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.bookingChat.placeholder}
                rows={2}
                disabled={sending}
                className="min-h-[44px] resize-none"
              />
              <Button
                type="button"
                size="icon"
                className="shrink-0 self-end"
                disabled={sending || !body.trim()}
                onClick={handleSend}
                aria-label={t.bookingChat.send}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
