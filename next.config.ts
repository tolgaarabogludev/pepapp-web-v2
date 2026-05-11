import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/erkeklerin-zevk-aldigi-noktalar",
        destination: "/tr/pepzine/erkeklerin-zevk-aldigi-noktalar",
        permanent: true,
      },
      {
        source: "/kediler-hakkinda-15-ilginc-bilgi",
        destination: "/tr/pepzine/kediler-hakkinda-15-ilginc-bilgi",
        permanent: true,
      },
    ];
  },
};

export default withPayload(withNextIntl(nextConfig));
