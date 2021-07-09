var glob = require('glob');
var fs = require('fs');
var copydir = require('copy-dir');

content = `

<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
<script defer src="https://unpkg.com/@lottiefiles/lottie-player@0.4.0/dist/lottie-player.js"></script>

`;

fs.rmdir('dist', { recursive: true }, (err) => {
	if (err) {
		throw err;
	}

	copydir(
		'components',
		'dist',
		{
			utimes: true, // keep add time and modify time
			mode: true, // keep file mode
			cover: true, // cover file when exists, default is true
		},
		function (err) {
			if (err) throw err;

			glob('dist/**/*.html', function (er, files) {
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
			});
		}
	);
});
