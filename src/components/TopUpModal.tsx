"use client";

import { useState, useEffect } from "react";
import { TOPUP_TIERS, TopupTier } from "@/lib/payment/vietqr";
import { formatVND } from "@/lib/utils";
import { X, QrCode, CheckCircle2, Loader2, Copy, Check, Clock, AlertCircle } from "lucide-react";

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TopupModal({ isOpen, onClose, onSuccess }: TopupModalProps) {
  const [selectedTier, setSelectedTier] = useState<TopupTier>(TOPUP_TIERS[1]); // default 100k
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setOrder(null);
      setIsCompleted(false);
      setTimeLeft(600);
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!order || isCompleted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [order, isCompleted, timeLeft]);

  // Polling order status
  useEffect(() => {
    if (!order || isCompleted) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/check?orderCode=${order.orderCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "completed") {
            setIsCompleted(true);
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 2500);
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [order, isCompleted, onSuccess, onClose]);

  if (!isOpen) return null;

  async function handleCreateOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selectedTier.id }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error("Order creation failed", err);
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, type: "code" | "account") {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 bg-surface border border-surface-border rounded-2xl shadow-2xl bento-glow animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-surface-subtle transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!order ? (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 mb-3">
                <QrCode className="w-3.5 h-3.5" />
                <span>Nạp Tiền VietQR Tự Động</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Chọn gói nạp Credit</h2>
              <p className="text-sm text-slate-400 mt-1">
                Tự động cộng tiền vào ví trong ~3 giây sau khi chuyển khoản.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {TOPUP_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`p-4 rounded-xl border text-left transition relative ${
                    selectedTier.id === tier.id
                      ? "bg-accent-cyan/10 border-accent-cyan text-white shadow-lg shadow-accent-cyan/10"
                      : "bg-obsidian border-surface-border text-slate-300 hover:border-slate-600"
                  }`}
                >
                  {tier.bonusPercentage > 0 && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-emerald text-black">
                      +{tier.bonusPercentage}% Bonus
                    </span>
                  )}
                  <p className="text-sm font-bold text-white">{formatVND(tier.amountVnd)}</p>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Nhận: {formatVND(tier.amountVnd + tier.bonusVnd)}
                  </p>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-obsidian border border-surface-border mb-6 flex items-start gap-3 text-xs text-slate-400">
              <AlertCircle className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
              <span>
                Hệ thống sử dụng cổng SePay tự động quét sao kê ngân hàng 24/7. Vui lòng giữ nguyên nội dung chuyển khoản để được cộng tiền tự động.
              </span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-accent-cyan to-accent-violet hover:opacity-95 transition shadow-lg shadow-accent-cyan/15 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <span>Tạo Mã VietQR Thanh Toán</span>
              )}
            </button>
          </div>
        ) : (
          <div>
            {isCompleted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-accent-emerald/20 text-accent-emerald flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Nạp tiền thành công!</h3>
                <p className="text-sm text-slate-300 mt-2">
                  Đã cộng <span className="text-accent-emerald font-bold font-mono">+{formatVND(order.totalCredit)}</span> vào ví của bạn.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-border">
                  <div>
                    <h3 className="text-base font-bold text-white">Quét mã VietQR để nạp</h3>
                    <p className="text-xs text-slate-400">Mở bất kỳ app ngân hàng nào để quét mã</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </div>
                </div>

                {/* QR Code image */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl mb-4">
                  <img
                    src={order.qrUrl}
                    alt="VietQR Code"
                    className="w-56 h-56 object-contain"
                  />
                  <p className="text-[11px] text-slate-600 font-mono mt-2">
                    Quét bằng app ngân hàng / Momo
                  </p>
                </div>

                {/* Transfer Info */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-surface-border">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="text-white font-bold">{order.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-surface-border">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-accent-cyan font-bold">{order.accountNo}</span>
                      <button
                        onClick={() => copyText(order.accountNo, "account")}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-surface-border">
                    <span className="text-slate-400">Số tiền:</span>
                    <span className="text-accent-emerald font-bold">{formatVND(order.amountVnd)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-obsidian border border-accent-cyan/40 bg-accent-cyan/5">
                    <span className="text-accent-cyan">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm tracking-wider">{order.orderCode}</span>
                      <button
                        onClick={() => copyText(order.orderCode, "code")}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-accent-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-cyan" />
                  <span>Đang lắng nghe chuyển khoản từ ngân hàng...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
