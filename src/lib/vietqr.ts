export interface VietQRParams {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  orderCode: string;
}

export function generateVietQRUrl({
  bankId,
  accountNo,
  accountName,
  amount,
  orderCode,
}: VietQRParams): string {
  // VietQR standard quicklink image API
  const encodedAccountName = encodeURIComponent(accountName);
  const encodedDescription = encodeURIComponent(orderCode);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;
}

export const DEPOSIT_TIERS = [
  {
    amount: 50000,
    label: "50,000đ",
    bonusPercent: 0,
    bonusCredit: 0,
    totalCredit: 50000,
    popular: false,
    tokensEstimate: "~500k token Claude / 5M token DeepSeek",
  },
  {
    amount: 100000,
    label: "100,000đ",
    bonusPercent: 5,
    bonusCredit: 5000,
    totalCredit: 105000,
    popular: true,
    tokensEstimate: "~1M token Claude / 10M token DeepSeek",
  },
  {
    amount: 200000,
    label: "200,000đ",
    bonusPercent: 10,
    bonusCredit: 20000,
    totalCredit: 220000,
    popular: false,
    tokensEstimate: "~2.2M token Claude / 22M token DeepSeek",
  },
  {
    amount: 500000,
    label: "500,000đ",
    bonusPercent: 15,
    bonusCredit: 75000,
    totalCredit: 575000,
    popular: false,
    tokensEstimate: "~5.7M token Claude / 57M token DeepSeek",
  },
];
