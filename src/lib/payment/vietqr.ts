export interface TopupTier {
  id: string;
  amountVnd: number;
  bonusVnd: number;
  bonusPercentage: number;
  isPopular?: boolean;
}

export const TOPUP_TIERS: TopupTier[] = [
  {
    id: "tier-50k",
    amountVnd: 50000,
    bonusVnd: 0,
    bonusPercentage: 0,
  },
  {
    id: "tier-100k",
    amountVnd: 100000,
    bonusVnd: 5000,
    bonusPercentage: 5,
    isPopular: true,
  },
  {
    id: "tier-200k",
    amountVnd: 200000,
    bonusVnd: 20000,
    bonusPercentage: 10,
  },
  {
    id: "tier-500k",
    amountVnd: 500000,
    bonusVnd: 75000,
    bonusPercentage: 15,
  },
];

export function generateOrderCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `AIHUB${randomString}`;
}

export function buildVietQRUrl(amount: number, orderCode: string): string {
  const bankId = process.env.NEXT_PUBLIC_BANK_NAME || "MBBank";
  const accountNo = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NO || "0123456789";
  const accountName = encodeURIComponent(process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "NGUYEN VAN A");
  const content = encodeURIComponent(orderCode);

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${content}&accountName=${accountName}`;
}
