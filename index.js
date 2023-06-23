const fs = require('fs');
const glob = require('glob');

const content = `
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://unpkg.com/@lottiefiles/lottie-player@0.4.0/dist/lottie-player.js"></script>
`;

function deleteDirectory(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function copyDirectory(src, dest) {
  fs.mkdirSync(dest);
  fs.readdirSync(src).forEach((file) => {
    const curPath = `${src}/${file}`;
    if (fs.statSync(curPath).isDirectory()) {
      copyDirectory(curPath, `${dest}/${file}`);
    } else {
      fs.copyFileSync(curPath, `${dest}/${file}`);
    }
  });
}

async function buildPages() {
  await deleteDirectory('./dist/');
  await copyDirectory('./components/', './dist/');

  const files = await glob.sync('dist/**/*.html');
  console.log('Total Components:', files.length);

  for (const filename of files) {
    console.log(filename);
    try {
      await fs.promises.appendFile(filename, content);
    } catch (err) {
      console.error(err);
    }
  }

  console.log('Tags Injected');
}

let mainIndex = '';

async function buildIndex() {
  const filenames = await glob.sync('dist/**/*.html');

  let dummyOk = null;

  for (const filename of filenames) {
    const newf = filename.replace('dist/', 'https://tailwind.besoeasy.com/');
    const newn = filename.replace('dist/', '');

    const parts = newn.split('/');

    console.log(parts[0]);

    if (dummyOk !== parts[0]) {
      mainIndex += `<div class="py-20 leading-none text-4xl uppercase">${parts[0]}</div>`;
    }

    dummyOk = parts[0];
    const nameS = parts[1].split('.html')[0];

    mainIndex += `<div class="m-5 uppercase"><a href="${newf}" class="text-xl">${nameS}</a></div>`;
  }

  const template = `
<section class="w-full px-8 text-gray-700 bg-white body-font tails-selected-element">
  <div class="container flex flex-col items-center justify-between py-5 mx-auto md:flex-row">
    <a href="https://tailwind.besoeasy.com/" class="inline-block font-sans text-2xl font-extrabold text-left text-black no-underline bg-transparent cursor-pointer focus:no-underline">Tailwind CSS Components</a>
    <div class="inline-flex items-center ml-5 space-x-6 lg:w-2/5 lg:justify-end lg:ml-0">
      <a href="https://github.com/besoeasy/tailwind-components" class="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-purple-600 border border-transparent shadow-sm rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700" data-rounded="rounded-xl" data-primary="purple-600">
        GITHUB
      </a>
    </div>
  </div>
</section>

<div class="py-20 px-2 m-auto max-w-5xl">${mainIndex}</div>

<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
`;

  try {
    await fs.promises.writeFile('./dist/index.html', template);
  } catch (err) {
    console.error(err);
  }
}

async function main() {
  try {
    await buildPages();
    await buildIndex();
  } catch (err) {
    console.error(err);
  }
}

main();
