import { DM_Sans, Mulish, Quicksand } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});
const mulish = Mulish({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mulish',
});
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-quicksand',
});

export { dmSans, mulish, quicksand };