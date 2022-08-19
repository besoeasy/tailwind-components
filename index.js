var fs = require('fs');

var glob = require('glob');

var content = `
<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
<script defer src="https://unpkg.com/@lottiefiles/lottie-player@0.4.0/dist/lottie-player.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/2.8.0/alpine.js"></script>
`;

function deletedirectory(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function (file, index) {
			var curPath = path + '/' + file;
			if (fs.statSync(curPath).isDirectory()) {
				deletedirectory(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
	}
}

function copydirectory(src, dest) {
	fs.mkdirSync(dest);
	fs.readdirSync(src).forEach(function (file) {
		var curPath = src + '/' + file;
		if (fs.statSync(curPath).isDirectory()) {
			copydirectory(curPath, dest + '/' + file);
		} else {
			fs.copyFileSync(curPath, dest + '/' + file);
		}
	});
}


async function build_pages() {
	await deletedirectory('./dist/');
	await copydirectory('./components/', './dist/');

	await glob('dist/**/*.html', function (er, files) {
		console.log('Total Components : ' + files.length);

		files.forEach((filename) => {
			console.log(filename);

			try {
				fs.appendFile(filename, content, (err) => {
					if (err) {
						console.error(err);
					}
				});
			} catch (err) {
				console.error(err);
			}
		});

		console.log('Tags Injected');
	});

}

let mainIndex = "";


async function build_index() {
	var filesnames = await glob.sync('dist/**/*.html');

	let dummyOk = null;


	filesnames.forEach((filename) => {

		newf = filename.replace('dist/', 'https://tailwind.besoeasy.com/')
		newn = filename.replace('dist/', '')

		var parts = newn.split('/');

		console.log(parts[0]);

		if (dummyOk !== parts[0]) {
			mainIndex += `<br>
            <div class="py-20 leading-none text-teal text-3xl uppercase">
			${parts[0]}
		    </div>
            `
		}

		dummyOk = parts[0];
		var nameS = parts[1].split('.html')[0];

		mainIndex += `<a href="${newf}" class="px-4 py-2 mr-5 mt-5 text-base rounded-full text-white bg-blue-400 ">${nameS}</a>`;
	})

	var template = `<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
	<section class="w-full px-8 text-gray-700 bg-white body-font tails-selected-element">
    <div class="container flex flex-col items-center justify-between py-5 mx-auto md:flex-row">

        <a href="https://tailwind.besoeasy.com/" class="inline-block font-sans text-2xl font-extrabold text-left text-black no-underline bg-transparent cursor-pointer focus:no-underline">
Tailwind CSS Components        </a>
        <div class="inline-flex items-center ml-5 space-x-6 lg:w-2/5 lg:justify-end lg:ml-0">
            <a href="https://github.com/besoeasy/tailwind-components" class="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-purple-600 border border-transparent shadow-sm rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700" data-rounded="rounded-xl" data-primary="purple-600">
                GITHUB
            </a>
        </div>

    </div>
</section>
<div class="py-20 px-2 m-auto container" >${mainIndex}</div>`;

	fs.writeFile('./dist/index.html', template, (err) => {
		if (err) {
			console.error(err);
		}
	})
}



async function main() {
	await build_pages();
	await build_index();
}

main()