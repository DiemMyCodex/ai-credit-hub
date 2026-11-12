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

  useEffect(() => {
    if (isOpen) {
      setOrder(null);
      setIsCompleted(false);
      setTimeLeft(600);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!order || isCompleted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [order, isCompleted, timeLeft]);

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
            }, 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-5 sm:p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {!order ? (
          <div>
            <div className="mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60 mb-2.5">
                <QrCode className="w-3 h-3 text-emerald-400" />
                <span>Nạp Tiền VietQR Tự Động</span>
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
                Chọn gói nạp Credit
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Tự động cộng tiền vào ví trong ~3 giây sau khi ngân hàng báo có.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {TOPUP_TIERS.map((tier) => {
                const isSelected = selectedTier.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3.5 rounded-lg border text-left transition relative ${
                      isSelected
                        ? "bg-zinc-800/90 border-zinc-300 ring-1 ring-zinc-300/40 text-white"
                        : "bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    }`}
                  >
                    {tier.bonusPercentage > 0 && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        +{tier.bonusPercentage}%
                      </span>
                    )}
                    <p className="text-sm font-semibold text-zinc-100">{formatVND(tier.amountVnd)}</p>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">
                      Nhận: {formatVND(tier.amountVnd + tier.bonusVnd)}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 mb-5 flex items-start gap-2.5 text-xs text-zinc-400">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
              <span>
                Cổng SePay quét sao kê ngân hàng 24/7. Vui lòng giữ nguyên nội dung chuyển khoản để khớp đơn tự động.
              </span>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs text-zinc-950 bg-white hover:bg-zinc-200 transition shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
              ) : (
                <span>Tạo Mã VietQR Thanh Toán</span>
              )}
            </button>
          </div>
        ) : (
          <div>
            {isCompleted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100">Nạp tiền thành công!</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Đã cộng <span className="text-emerald-400 font-semibold font-mono">+{formatVND(order.totalCredit)}</span> vào ví.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Quét mã VietQR để nạp</h3>
                    <p className="text-xs text-zinc-400">Dùng app ngân hàng bất kỳ để quét mã</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>
                      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                    </span>
                  </div>
                </div>

                {/* QR Code image */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg mb-3">
                  <img
                    src={order.qrUrl}
                    alt="VietQR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                  <p className="text-[10px] text-zinc-600 font-mono mt-1.5">
                    Quét bằng app ngân hàng / Smart Banking
                  </p>
                </div>

                {/* Transfer Info */}
                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 font-sans">Ngân hàng:</span>
                    <span className="text-zinc-200 font-medium">{order.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 font-sans">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 font-medium">{order.accountNo}</span>
                      <button
                        onClick={() => copyText(order.accountNo, "account")}
                        className="text-zinc-400 hover:text-white"
                        title="Sao chép STK"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                    <span className="text-zinc-500 font-sans">Số tiền:</span>
                    <span className="text-emerald-400 font-semibold">{formatVND(order.amountVnd)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950 border border-zinc-700">
                    <span className="text-zinc-400 font-sans">Nội dung CK:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs tracking-wider">{order.orderCode}</span>
                      <button
                        onClick={() => copyText(order.orderCode, "code")}
                        className="text-zinc-400 hover:text-white"
                        title="Sao chép nội dung"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Đang tự động xác nhận giao dịch...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
