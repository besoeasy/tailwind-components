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
      await checkAssetsForDomains(filename);
      await fs.appendFile(filename, content);
    }

    console.log("Tags Injected");
  } catch (err) {
    console.error("Error building pages:", err);
  }
}

async function buildIndex() {
  try {
    const filenames = await glob.sync("dist/**/*.html");
    const indexEntries = {};

    for (const filename of filenames) {
      const newn = filename.replace("dist/", "");
      const parts = newn.split("/");
      const directoryName = parts[0];
      const nameS = parts[1].split(".html")[0];

      if (!indexEntries[directoryName]) {
        indexEntries[directoryName] = [];
      }

      const fileUrl = filename.replace(
        "dist/",
        "https://tailwind.besoeasy.com/"
      );
      const link = `<div class="col-span-1"><a class="m-5" href="${fileUrl}">${nameS}</a><div>`;

      indexEntries[directoryName].push(link);
    }

    let mainIndex = "";

    mainIndex += ` <div class="grid grid-cols-8 gap-4">`;

    for (const directory in indexEntries) {
      mainIndex += `<div class="text-3xl col-span-8">${directory}</div>`;
      mainIndex += indexEntries[directory].join("");
    }

    mainIndex += ` </div>`;

    const indexHTML = `


    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tailwind Components</title>
  </head>

  <body>
  <div class="bg-yellow-100">
       <section class="container mx-auto py-40 m-5">
        <div class="-m-6 flex flex-wrap items-center lg:-m-11">
          <div class="w-full p-6 lg:w-1/2 lg:p-11">
            <div class="lg:max-w-xl">
              <h2 class="font-heading mb-5 text-6xl font-bold text-gray-900 sm:text-7xl">TAILWIND COMPONENTS</h2>
              <p class="mb-9 text-gray-600">
                <span style="color: rgb(55, 65, 81); font-family: 'Söhne', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Cantarell', 'Noto Sans', sans-serif, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; font-size: 16px; white-space-collapse: preserve;">Elevate Your UI: Tailwind Components Library - Where Design Meets Open Source!</span>
              </p>
              <a href="https://github.com/besoeasy/tailwind-components" class="font-heading w-full rounded-full bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 lg:w-auto">GITHUB</a>
            </div>
          </div>
          <div class="w-full p-6 lg:w-1/2 lg:p-11">
            <div class="ml-auto lg:max-w-md">
              <div class="flex w-full flex-wrap lg:-m-3">
                <div class="w-full p-3">
                  <div class="shadow-4xl rounded-2xl bg-white p-4">
                    <div class="-m-2 flex flex-wrap items-center">
                      <div class="w-auto p-2">
                        <div class="bg-gradient-red flex h-11 w-11 items-center justify-center rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      </div>
                      <div class="w-auto p-2">
                        <h3 class="font-heading text-base font-medium text-gray-900">Open Source</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-full p-3">
                  <div class="shadow-4xl transform rounded-2xl bg-white p-4 opacity-70 transition duration-500 ease-in-out hover:translate-x-6 lg:relative lg:-left-6">
                    <div class="-m-2 flex flex-wrap items-center">
                      <div class="w-auto p-2">
                        <div class="bg-gradient-green flex h-11 w-11 items-center justify-center rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                          </svg>
                        </div>
                      </div>
                      <div class="w-auto p-2">
                        <h3 class="font-heading text-base font-medium text-gray-900">Free Forever</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-full p-3">
                  <div class="shadow-4xl rounded-2xl bg-white p-4 opacity-50">
                    <div class="-m-2 flex flex-wrap items-center">
                      <div class="w-auto p-2">
                        <div class="bg-gradient-violet flex h-11 w-11 items-center justify-center rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                          </svg>
                        </div>
                      </div>
                      <div class="w-auto p-2">
                        <h3 class="font-heading text-base font-medium text-gray-900">Community Powered</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="w-full p-3">
                  <div class="shadow-4xl transform rounded-2xl bg-white p-4 opacity-30 transition duration-500 ease-in-out hover:translate-x-6 lg:relative lg:-left-6">
                    <div class="-m-2 flex flex-wrap items-center">
                      <div class="w-auto p-2">
                        <div class="bg-gradient-pink flex h-11 w-11 items-center justify-center rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                          </svg>
                        </div>
                      </div>
                      <div class="w-auto p-2">
                        <h3 class="font-heading text-base font-medium text-gray-900">Contributions Welcome</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section></div>
    <section class="m-auto container py-20 m-5 uppercase">
    ${mainIndex}
  </section>
  </body>
  <script defer src="https://cdn.tailwindcss.com"></script>

</html>

    `;

    await fs.writeFile("./dist/index.html", indexHTML);
    console.log("Index built successfully.");
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
