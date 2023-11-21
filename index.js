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

async function deleteDirectory(path) {
  try {
    if (await fs.access(path)) {
      const files = await fs.readdir(path);
      for (const file of files) {
        const curPath = `${path}/${file}`;
        const stats = await fs.stat(curPath);
        if (stats.isDirectory()) {
          await deleteDirectory(curPath);
        } else {
          await fs.unlink(curPath);
        }
      }
      await fs.rmdir(path);
    }
  } catch (err) {
    console.error(`Error deleting directory ${path}:`, err);
  }
}

async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest);
    const files = await fs.readdir(src);
    for (const file of files) {
      const curPath = `${src}/${file}`;
      const stats = await fs.stat(curPath);
      if (stats.isDirectory()) {
        await copyDirectory(curPath, `${dest}/${file}`);
      } else {
        await fs.copyFile(curPath, `${dest}/${file}`);
      }
    }
  } catch (err) {
    console.error(`Error copying directory ${src} to ${dest}:`, err);
  }
}

async function buildPages() {
  try {
    await deleteDirectory("./dist/");
    await copyDirectory("./components/", "./dist/");
    await copyDirectory("./public/", "./dist/");

    const files = await glob.sync("dist/**/*.html");
    console.log("Total Components:", files.length);

    for (const filename of files) {
      console.log(filename);
      checkAssetsForDomains(filename);

      await fs.appendFile(filename, content);
    }

    console.log("Tags Injected");
  } catch (err) {
    console.error("Error building pages:", err);
  }
}

async function buildIndex() {
  try {
    let mainIndex = "";
    const filenames = await glob.sync("dist/**/*.html");
    let previousDirectory = null;

    for (const filename of filenames) {
      const newf = filename.replace("dist/", "https://tailwind.besoeasy.com/");
      const newn = filename.replace("dist/", "");
      const parts = newn.split("/");

      if (previousDirectory !== parts[0]) {
        mainIndex += `<div class="py-20 leading-none text-4xl uppercase">${parts[0]}</div>`;
      }

      previousDirectory = parts[0];
      const nameS = parts[1].split(".html")[0];

      mainIndex += `<div class="m-5 uppercase"><a href="${newf}" class="text-xl">${nameS}</a></div>`;
    }

    const template = `
    <!-- Your HTML template -->
    `;

    await fs.writeFile("./dist/index.html", template);
  } catch (err) {
    console.error("Error building index:", err);
  }
}

async function main() {
  try {
    await buildPages();
    await buildIndex();
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
