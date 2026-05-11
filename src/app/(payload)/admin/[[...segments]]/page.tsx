import config from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import { importMap } from "../importMap.js";

type AdminPageProps = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = (props: AdminPageProps) =>
  generatePageMetadata({
    config,
    params: props.params,
    searchParams: props.searchParams,
  });

export default function Page(props: AdminPageProps) {
  return RootPage({
    config,
    importMap,
    params: props.params,
    searchParams: props.searchParams,
  });
}