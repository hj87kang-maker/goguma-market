"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "@/app/chat/actions";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

export function ChatMessages({
  roomId,
  currentUserId,
  initialMessages,
}: {
  roomId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    (async () => {
      // 페이지가 쿠키의 기존 세션으로 로드된 경우, 브라우저 클라이언트가
      // Realtime 소켓에 인증 토큰을 자동으로 실어주지 않을 수 있다.
      // 이 경우 RLS가 익명 사용자로 평가돼 postgres_changes 이벤트가 전부 걸러진다.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }
      if (cancelled) return;

      channel = supabase
        .channel(`messages:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_room_id=eq.${roomId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) =>
              prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
            );
          },
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="mt-4 flex flex-1 flex-col">
      <div className="flex flex-col gap-2">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
            첫 메시지를 보내보세요.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === currentUserId;
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    isMine
                      ? "bg-brand-600 text-white"
                      : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        action={sendMessageAction}
        className="sticky bottom-16 mt-4 flex gap-2 border-t border-neutral-200 bg-white py-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <input type="hidden" name="roomId" value={roomId} />
        <input
          type="text"
          name="content"
          placeholder="메시지를 입력하세요"
          autoComplete="off"
          required
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          전송
        </button>
      </form>
    </div>
  );
}
