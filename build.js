const fs = require("fs").promises;

const glob = require("glob");

const cheerio = require("cheerio");

const content = `
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://unpkg.com/@lottiefiles/lottie-player@0.4.0/dist/lottie-player.js"></script>
`;

const allowedDomains = [
  "https://tailwind.besoeasy.com/",
  "https://cdn.tailwindcss.com",
  "https://unpkg.com",
];

async function checkAssetsForDomains(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const $ = cheerio.load(fileContent);

    $("img, script[src], link[href]").each(function () {
      const assetSrc = $(this).attr("src") || $(this).attr("href");
      if (
        assetSrc &&
        !allowedDomains.some((domain) => assetSrc.startsWith(domain))
      ) {
        console.log(
          `File: ${filePath} contains asset not from the specified domain: ${assetSrc}`
        );
      }
    });
  } catch (err) {
    console.error("Error reading file or checking assets:", err);
  }
}

async function buildPages() {
  try {
    const files = await glob.sync("dist/**/*.html");

    console.log("Total Components:", files.length);

    for (const filename of files) {
      await checkAssetsForDomains(filename);
      await fs.appendFile(filename, content);
    }

    console.log("Tags Injected");
  } catch (err) {
    console.error("Error building pages:", err);
  }
}

buildPages();
