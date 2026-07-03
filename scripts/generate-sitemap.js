/**
 * Generate sitemap.xml for static export.
 * Run after build: node scripts/generate-sitemap.js
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://liuhao522.github.io/memory-blog";
const OUT_DIR = path.join(__dirname, "..", "out");

function getUrls() {
  const urls = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/about", priority: "0.8", changefreq: "monthly" },
  ];

  // Read slugs from content directory
  const contentDir = path.join(__dirname, "..", "content");
  if (fs.existsSync(contentDir)) {
    const files = fs
      .readdirSync(contentDir)
      .filter((f) => f.endsWith(".md") && f !== "MEMORY.md");

    files.forEach((file) => {
      const slug = file.replace(/\.md$/, "");
      urls.push({
        loc: `/${slug}`,
        priority: "0.7",
        changefreq: "monthly",
      });
    });
  }

  return urls;
}

function generateSitemap() {
  const urls = getUrls();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq }) =>
      `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const outPath = path.join(OUT_DIR, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf-8");
  console.log(`✅ Sitemap generated: ${outPath} (${urls.length} URLs)`);
}

generateSitemap();
