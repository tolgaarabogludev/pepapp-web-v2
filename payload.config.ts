

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";

import sharp from "sharp";
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL or POSTGRES_URL is required.");
}


export default buildConfig({
  admin: {
    user: "users",
    meta: {
      titleSuffix: "- Pepapp Content",
    },
  },
  collections: [
    {
      slug: "users",
      auth: true,
      admin: {
        useAsTitle: "email",
      },
      fields: [],
    },
    {

      slug: "media",
    
      access: {
    
        read: () => true,
    
      },
    
      upload: {
        mimeTypes: ["image/*"],
        imageSizes: [
          {
            name: "card",
            width: 800,
            height: 600,
            fit: "cover",
            formatOptions: {
              format: "webp",
              options: {
                quality: 78,
              },
            },
          },
          {
            name: "thumb",
            width: 400,
            height: 300,
            fit: "cover",
            formatOptions: {
              format: "webp",
              options: {
                quality: 72,
              },
            },
          },
          {
            name: "hero",
            width: 1600,
            height: 900,
            fit: "inside",
            formatOptions: {
              format: "webp",
              options: {
                quality: 82,
              },
            },
          },
        ],
        resizeOptions: {
          width: 1600,
          withoutEnlargement: true,
          fit: "inside",
        },
        formatOptions: {
          format: "webp",
          options: {
            quality: 82,
            effort: 6,
          },
        },
        adminThumbnail: "thumb",
      },
      admin: {
        useAsTitle: "alt",
      },
      fields: [
        {
          name: "alt",
          type: "text",
          required: true,
        },
      ],
    },
    {
      slug: "categories",
      admin: {
        useAsTitle: "title",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
        },
      ],
    },
    {
      slug: "tags",
      admin: {
        useAsTitle: "title",
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
        },
      ],
    },
    {
      slug: "redirects",
      access: {
        read: () => true,
      },
      admin: {
        useAsTitle: "source",
        defaultColumns: ["source", "destination", "statusCode", "enabled"],
      },
      fields: [
        {
          name: "source",
          type: "text",
          required: true,
          unique: true,
          admin: {
            description: "Eski URL path. Örn: /erkeklerin-zevk-aldigi-noktalar/",
          },
        },
        {
          name: "destination",
          type: "text",
          required: true,
          admin: {
            description: "Yeni URL path. Örn: /tr/pepzine/erkeklerin-zevk-aldigi-noktalar",
          },
        },
        {
          name: "statusCode",
          type: "select",
          required: true,
          defaultValue: "301",
          options: [
            {
              label: "301 Permanent",
              value: "301",
            },
            {
              label: "302 Temporary",
              value: "302",
            },
          ],
        },
        {
          name: "enabled",
          type: "checkbox",
          defaultValue: true,
        },
      ],
    },
    {
      slug: "posts",
      versions: {
        drafts: true,
      },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "webEnabled", "category", "publishedAt", "updatedAt"],
      },
      fields: [
        {
          type: "tabs",
          tabs: [
            {
              label: "Content",
              fields: [
                {
                  name: "title",
                  type: "text",
                  required: true,
                  localized: true,
                },
                {
                  name: "excerpt",
                  type: "textarea",
                  required: true,
                  localized: true,
                },
                {
                  name: "body",
                  type: "richText",
                  editor: lexicalEditor({}),
                  required: true,
                  localized: true,
                },
                {
                  name: "coverImage",
                  type: "upload",
                  relationTo: "media",
                },
                {
                  name: "imageAlt",
                  type: "text",
                  localized: true,
                },
              ],
            },
            {
              label: "SEO",
              fields: [
                {
                  name: "webEnabled",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    description: "İşaretlenirse yazı web sitesinde yayınlanabilir.",
                  },
                },
                {
                  name: "slug",
                  type: "text",
                  required: true,
                  unique: true,
                  admin: {
                    description: "Web URL slug. Örn: erkeklerin-zevk-aldigi-noktalar",
                  },
                },
                {
                  name: "seoTitle",
                  type: "text",
                  localized: true,
                },
                {
                  name: "seoDescription",
                  type: "textarea",
                  localized: true,
                },
                {
                  name: "canonicalUrl",
                  type: "text",
                },
                {
                  name: "noIndex",
                  type: "checkbox",
                  defaultValue: false,
                },
                {
                  name: "oldUrl",
                  type: "text",
                  admin: {
                    description: "Eski WordPress URL path. Örn: /erkeklerin-zevk-aldigi-noktalar/",
                  },
                },
              ],
            },
            {
              label: "Relations",
              fields: [
                {
                  name: "category",
                  type: "relationship",
                  relationTo: "categories",
                  required: true,
                },
                {
                  name: "tags",
                  type: "relationship",
                  relationTo: "tags",
                  hasMany: true,
                },
                {
                  name: "relatedPosts",
                  type: "relationship",
                  relationTo: "posts",
                  hasMany: true,
                  admin: {
                    description: "Web yazısının sonunda kart olarak gösterilecek ilişkili yazılar.",
                  },
                },
                {
                  name: "faqs",
                  type: "array",
                  localized: true,
                  fields: [
                    {
                      name: "question",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "answer",
                      type: "textarea",
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              label: "Publishing",
              fields: [
                {
                  name: "publishedAt",
                  type: "date",
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: "dayAndTime",
                    },
                  },
                },
                {
                  name: "originalPublishedAt",
                  type: "date",
                  admin: {
                    description: "Eski sitedeki gerçek ilk yayın tarihi.",
                    date: {
                      pickerAppearance: "dayAndTime",
                    },
                  },
                },
                {
                  name: "updatedAt",
                  type: "date",
                  admin: {
                    description: "SEO için gösterilecek son büyük güncelleme tarihi.",
                    date: {
                      pickerAppearance: "dayAndTime",
                    },
                  },
                },
                {
                  name: "readingTime",
                  type: "number",
                  min: 1,
                  admin: {
                    description: "Dakika cinsinden okuma süresi.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  plugins: [
    vercelBlobStorage({
      enabled: process.env.BLOB_READ_WRITE_TOKEN !== undefined,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
  }),
  editor: lexicalEditor({}),
  localization: {
    locales: ["tr", "en", "es"],
    defaultLocale: "tr",
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",
  sharp,
});