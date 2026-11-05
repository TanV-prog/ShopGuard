import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ShopGuard: AI Order Assistant with Spending Guardrail',
  description: 'AI order assistant for small businesses with deterministic code pricing, spending guardrails, owner PIN approval, and PayPal sandbox payments.',
  openGraph: {
    title: 'ShopGuard: AI Order Assistant with Spending Guardrail',
    description: 'AI order assistant for small businesses with deterministic code pricing, spending guardrails, owner PIN approval, and PayPal sandbox payments.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShopGuard: AI Order Assistant with Spending Guardrail',
    description: 'AI order assistant for small businesses with deterministic code pricing, spending guardrails, owner PIN approval, and PayPal sandbox payments.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
