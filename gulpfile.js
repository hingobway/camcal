const { src, dest, watch } = require('gulp');
const postcss = require('gulp-postcss');
const easing = require('postcss-easing-gradients');

const css = (exports.css = () =>
  src('src/css/*.css')
    .pipe(postcss([easing]))
    .pipe(dest('src/styles')));

exports.dev = () => watch('src/css/', css);
