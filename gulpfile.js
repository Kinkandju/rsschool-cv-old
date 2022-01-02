const source_folder = "src";

const path = {
	build: {
		html: "./",
		css: "./css/",
		js: "./js/",
		img: "./assets/img/",
		svg: "./assets/svg/",
		fonts: "./assets/fonts/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/index.js",
		img: source_folder + "/assets/img/**/*.{jpg,png,gif,ico,webp}",
		svg: [source_folder + "/assets/svg/**/*.svg", "!" + source_folder + "/assets/svg/iconsprite/*.svg"],
		fonts: source_folder + "/assets/fonts/*.{woff,woff2}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/assets/img/**/*.{jpg,png,gif,ico,webp}",
		svg: source_folder + "/assets/svg/**/*.svg"
	},
	clean: ["./index.html", "./css/", "./js/", "./assets/img/", "./assets/svg/"]
}

const { src, dest } = require("gulp"),
	gulp = require("gulp"),
	browsersync = require("browser-sync").create(),
	fileinclude = require("gulp-file-include"),
	del = require("del"),
	sass = require("gulp-sass")(require("sass")),
	autoprefixer = require("gulp-autoprefixer"),
	groupmedia = require("gulp-group-css-media-queries"),
	cleancss = require("gulp-clean-css"),
	rename = require("gulp-rename"),
	uglify = require("gulp-uglify-es").default,
	svgsprite = require("gulp-svg-sprite");

const browserSync = (params) => {
	browsersync.init({
		server: {
			baseDir: "./"
		},
		port: 3000,
		notify: false
	})
}

const parseHtml = () => {
	return src(path.src.html)
		.pipe(fileinclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

const parseCss = () => {
	return src(path.src.css)
		.pipe(
			sass({
				outputStyle: "expanded"
			})
		)
		.pipe(
			groupmedia()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(cleancss())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}

const parseJs = () => {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

const createImages = () => {
	return src(path.src.img)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

const createSvg = () => {
	return src(path.src.svg)
		.pipe(dest(path.build.svg))
		.pipe(browsersync.stream())
}

const svgSprite = () => {
	return gulp.src([source_folder + "/assets/svg/iconsprite/*.svg"])
		.pipe(svgsprite({
			mode: {
				stack: {
					sprite: "../icons.svg",
				}
			}
		}))
		.pipe(dest(path.build.svg))
}

const parseFonts = () => {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(browsersync.stream())
}

const watchFiles = (params) => {
	gulp.watch([path.watch.html], parseHtml);
	gulp.watch([path.watch.css], parseCss);
	gulp.watch([path.watch.js], parseJs);
	gulp.watch([path.watch.img], createImages);
	gulp.watch([path.watch.svg], createSvg);
}

const cleanFolder = (params) => {
	return del(path.clean);
}

let build = gulp.series(cleanFolder, gulp.parallel(parseJs, parseCss, parseHtml, createImages, createSvg, svgSprite, parseFonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.parseFonts = parseFonts;
exports.svgSprite = svgSprite;
exports.createSvg = createSvg;
exports.createImages = createImages;
exports.parseJs = parseJs;
exports.parseCss = parseCss;
exports.parseHtml = parseHtml;
exports.build = build;
exports.watch = watch;
exports.default = watch;