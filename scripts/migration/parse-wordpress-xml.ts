import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const DEFAULT_XML_PATH = "/Users/tolgaaraboglu/Downloads/pepapp.WordPress.2026-05-06.xml";
const OUTPUT_DIR = path.join(process.cwd(), "migration-output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "posts.json");

type WordPressXmlValue =
  | string
  | number
  | null
  | undefined
  | { "#text"?: WordPressXmlValue }
  | WordPressXmlValue[];

type WordPressCategory = string | { "#text"?: string; domain?: string; nicename?: string };

type WordPressPostMeta = {
  wp_meta_key?: WordPressXmlValue;
  wp_meta_value?: WordPressXmlValue;
};

type WordPressItem = {
  title?: WordPressXmlValue;
  link?: WordPressXmlValue;
  pubDate?: WordPressXmlValue;
  category?: WordPressCategory | WordPressCategory[];
  "content:encoded"?: WordPressXmlValue;
  "excerpt:encoded"?: WordPressXmlValue;
  "wp:post_id"?: WordPressXmlValue;
  "wp:post_name"?: WordPressXmlValue;
  "wp:post_type"?: WordPressXmlValue;
  "wp:status"?: WordPressXmlValue;
  "wp:post_date"?: WordPressXmlValue;
  "wp:post_date_gmt"?: WordPressXmlValue;
  "wp:post_modified"?: WordPressXmlValue;
  "wp:post_modified_gmt"?: WordPressXmlValue;
  "wp:postmeta"?: WordPressPostMeta | WordPressPostMeta[];
};

type NormalizedPost = {
  id: string;
  title: string;
  slug: string;
  oldUrl: string;
  status: string;
  publishedAt: string | null;
  modifiedAt: string | null;
  excerpt: string;
  contentHtml: string;
  categories: string[];
  tags: string[];
  featuredImageId?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
};

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function cleanText(value?: WordPressXmlValue) {
  if (value == null) return "";

  if (Array.isArray(value)) {
    return cleanText(value[0]);
  }

  if (typeof value === "object") {
    return cleanText(value["#text"]);
  }

  return String(value)
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/[\u2028\u2029]/g, "\n")
    .trim();
}

function normalizeDate(value?: WordPressXmlValue) {
  const cleanedValue = cleanText(value);
  if (!cleanedValue || cleanedValue === "0000-00-00 00:00:00") return null;

  const normalizedValue = cleanedValue.includes("T")
    ? cleanedValue
    : cleanedValue.replace(" ", "T");

  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) return cleanedValue;

  return date.toISOString();
}

function splitTaxonomies(categories: WordPressItem["category"]) {
  const normalizedCategories: string[] = [];
  const tags: string[] = [];

  asArray(categories).forEach((category) => {
    if (typeof category === "string") {
      normalizedCategories.push(cleanText(category));
      return;
    }

    const label = cleanText(category["#text"]);
    if (!label) return;

    if (category.domain === "post_tag") {
      tags.push(label);
      return;
    }

    normalizedCategories.push(label);
  });

  return {
    categories: Array.from(new Set(normalizedCategories)),
    tags: Array.from(new Set(tags)),
  };
}

function getMeta(item: WordPressItem, key: string) {
  return asArray(item["wp:postmeta"]).find((meta) => cleanText(meta.wp_meta_key) === key)?.wp_meta_value;
}

function normalizePost(item: WordPressItem): NormalizedPost {
  const { categories, tags } = splitTaxonomies(item.category);

  return {
    id: cleanText(item["wp:post_id"]),
    title: cleanText(item.title),
    slug: cleanText(item["wp:post_name"]),
    oldUrl: cleanText(item.link),
    status: cleanText(item["wp:status"]),
    publishedAt: normalizeDate(item["wp:post_date_gmt"] || item["wp:post_date"]),
    modifiedAt: normalizeDate(item["wp:post_modified_gmt"] || item["wp:post_modified"]),
    excerpt: cleanText(item["excerpt:encoded"]),
    contentHtml: cleanText(item["content:encoded"]),
    categories,
    tags,
    featuredImageId: cleanText(getMeta(item, "_thumbnail_id")) || undefined,
    seoTitle:
      cleanText(getMeta(item, "_yoast_wpseo_title")) ||
      cleanText(getMeta(item, "rank_math_title")) ||
      undefined,
    seoDescription:
      cleanText(getMeta(item, "_yoast_wpseo_metadesc")) ||
      cleanText(getMeta(item, "rank_math_description")) ||
      undefined,
    focusKeyword:
      cleanText(getMeta(item, "_yoast_wpseo_focuskw")) ||
      cleanText(getMeta(item, "rank_math_focus_keyword")) ||
      undefined,
  };
}

async function main() {
  const xmlPath = process.argv[2] || DEFAULT_XML_PATH;
  const xml = (await fs.readFile(xmlPath, "utf8")).replace(/[\u2028\u2029]/g, "\n");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    cdataPropName: "#text",
    textNodeName: "#text",
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: false,
  });

  const parsed = parser.parse(xml);
  const items = asArray<WordPressItem>(parsed?.rss?.channel?.item);

  const posts = items
    .filter((item) => cleanText(item["wp:post_type"]) === "post")
    .filter((item) => cleanText(item["wp:status"]) === "publish")
    .map(normalizePost)
    .filter((post) => post.title && post.slug);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf8");

  const categories = Array.from(new Set(posts.flatMap((post) => post.categories))).sort();
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();

  console.log(`Parsed ${posts.length} published posts`);
  console.log(`Found ${categories.length} categories`);
  console.log(`Found ${tags.length} tags`);
  console.log(`Output: ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
