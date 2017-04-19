/*
var gulp       = require('gulp'),
    concat     = require('gulp-concat'),
    cleanCSS  = require('gulp-clean-css'),
    uglify     = require('gulp-uglify'),
    nunjucks     = require("gulp-nunjucks"),
    rename     = require("gulp-rename"),
    coffee     = require("gulp-coffee"),
    htmlreplace = require("gulp-html-replace"),
    minifyHTML = require("gulp-minify-html");
*/
    
var gulp  = require('gulp'), coffee = require("gulp-coffee");
gulp.task('coffee',function(){
    gulp.src(['c/**/*.coffee','static/**/*.coffee','lib/**/*.coffee','*.coffee'],{base: "./"})
    .pipe(coffee())
    .on('error',function($err){
        console.log(err.toString());
        this.emit('end');
        
    })
    .pipe(gulp.dest("./"))
    
    
});
gulp.task('watch',function(){
    
    gulp.watch('./**/*.coffee', ['coffee'])
    
}); 
gulp.task('default', ['coffee','watch']);