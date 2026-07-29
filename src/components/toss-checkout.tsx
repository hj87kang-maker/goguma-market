"use client";

import Script from "next/script";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

type TossPayment = {
  requestPayment: (options: {
    method: "CARD";
    amount: { currency: "KRW"; value: number };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerEmail?: string;
    customerName?: string;
    card?: { useEscrow: boolean; flowMode: string };
  }) => Promise<void>;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => {
      payment: (options: { customerKey: string }) => TossPayment;
    };
  }
}

export function TossCheckout({
  paymentId,
  amount,
  orderName,
  customerKey,
  customerEmail,
  customerName,
}: {
  paymentId: string;
  amount: number;
  orderName: string;
  customerKey: string;
  customerEmail: string;
  customerName: string;
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);

  async function handlePay() {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey || !window.TossPayments) {
      setError("결제 모듈을 불러오지 못했습니다.");
      return;
    }

    setRequesting(true);
    setError(null);

    try {
      const tossPayments = window.TossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey });
      const origin = window.location.origin;

      await payment.requestPayment({
        method: "CARD",
        amount: { currency: "KRW", value: amount },
        orderId: paymentId,
        orderName,
        successUrl: `${origin}/payments/success`,
        failUrl: `${origin}/payments/fail`,
        customerEmail,
        customerName,
        card: { useEscrow: false, flowMode: "DEFAULT" },
      });
    } catch {
      setError("결제 요청 중 문제가 발생했습니다. 다시 시도해주세요.");
      setRequesting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={!sdkReady || requesting}
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {requesting ? "결제 요청 중..." : `${formatPrice(amount)} 카드로 결제하기`}
      </button>
    </div>
  );
}
