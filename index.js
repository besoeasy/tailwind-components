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


async function build_index() {
	var filesnames = await glob.sync('dist/**/*.html');

	filesnames.forEach((filename) => {

		newf = filename.replace('dist/', 'https://tailwind.besoeasy.com/')
		newn = filename.replace('dist/', '')

		mainIndex += `<br><a href="${newf}">${newn}</a>`;
	})

	fs.writeFile('./dist/index.html', mainIndex, (err) => {
		if (err) {
			console.error(err);
		}
	})
}


let mainIndex = ''

async function main() {
	await build_pages();
	await build_index();
}

main()