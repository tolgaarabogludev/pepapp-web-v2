import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Disable the Next.js 15.5 DevTools panel — its SegmentViewNode component
  // fails to appear in the React Client Manifest when [locale] dynamic segments
  // are present, causing a 500 in dev mode. Production builds are unaffected.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
