import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/products", "/gallery", "/blog", "/contact"],
        disallow: ["/dashboard/", "/login", "/api/"],
      },
    ],
    sitemap: "https://msbpharmachem.com/sitemap.xml",
  };
}
