//  "gulp": "^4.0.2"
/**
 * 一、项目执行指令
 *  $ glup  将执行gulp默认任务 ‘default’   default任务将按顺序依次执行 ‘revless','revCss','revJs','revHtml 任务
 *  $ glup watch  将执行监听 *.less / *.js 的变动，自动执行 以上的默认任务
 *
 * 二、执行项目的原理和目的
 *  task:revless 将less 编译成css
 *       revCss 将所有的css文件名进行MD5处理加上版本号并以对象{文件名：文件名?v=版本号} 的形式保存在自定义rev文件夹json文件中
 *       revJs  将所有的js文件名进行MD5处理加上版本号并以对象{文件名：文件名?v=版本号} 的形式保存在自定义rev文件夹json文件中
 *       revHtml  将在Html文件中 根据自定义rev文件夹中声明的版本对象为依据来替换css、js文件版本
 *
 * 三、gulp方法介绍
 *  gulp.task('',() => )   建立任务
 *  gulp.src()             资源路径
 *  gulp.pipe()            执行事件
 *  gulp.pipe(gulp.dest()) 设置输出位置
 *
 * 四、事件介绍
 * less()  将less编译成css
 * rev()   为静态文件随机添加一串hash值
 * rev.manifest()  生成源文件和添加hash后文件的映射 {文件名：文件名?v=版本号} 形式
 * revCollector()  根据rev生成的manifest.json文件中的映射, 去替换文件名称, 也可以替换路径
 * */

const gulp = require('gulp'),
    rev = require('gulp-rev'),
    less = require('gulp-less'),
    revCollector = require('gulp-rev-collector');

const cssSrc = 'css/**/*.css',  jsSrc = 'js/**/*.js';

// less编译成css
gulp.task('revless',function () {
    return gulp.src('css/**/*less')
        .pipe(less())
        .pipe(gulp.dest('css'));
})

// CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function(){
    return gulp.src(cssSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css'));
});

// js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function(){
    return gulp.src(jsSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js'));
});

// Html替换css、js文件版本
gulp.task('revHtml', function(){
    return gulp.src(['rev/**/*.json', 'html/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('html'));
});


// 4.0 gulp 写法
// gulp.series：按照顺序执行
// gulp.paralle：可以并行计算


//Html替换css、js文件版本
gulp.task('default',gulp.series('revless','revCss','revJs','revHtml'));

gulp.task('watch',function(){
    gulp.watch('css/**/*.less',gulp.series('default'))
    gulp.watch('js/**/*',gulp.series('default'))
})

/*  需要修改文件
1、
打开 node_modules\gulp-rev\index.js
134行：manifest[originalFile] = revisionedFile;
更新为：manifest[originalFile] = originalFile + '?v=' + file.revHash;

2、
打开 node_modules\rev-path\index.js  
9行 return modifyFilename(pth, (filename, ext) => `${filename}-${hash}${ext}`);
更新为：return modifyFilename(pth, (filename, ext) => `${filename}${ext}`);
17行 return modifyFilename(pth, (filename, ext) => filename.replace(new RegExp(`-${hash}$`), '') + ext);
更新为： return modifyFilename(pth, (filename, ext) => filename + ext);

3、
打开 node_modules\gulp-rev-collector\index.js
40行：var cleanReplacement =  path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' );
更新为：var cleanReplacement =  path.basename(json[key]).split('?')[0];

4、
打开 node_modules\gulp-assets-rev\index.js
78行 var verStr = (options.verConnecter || "-") + md5;
更新为：var verStr = (options.verConnecter || "") + md5;
80行 src = src.replace(verStr, '').replace(/(\.[^\.]+)$/, verStr + "$1");
更新为：src=src+"?v="+verStr;

5、
打开 node_modules\gulp-rev-collector\index.js
第173行regexp: new RegExp( prefixDelim + pattern, 'g' ),
更新为 regexp: new RegExp( prefixDelim + pattern + '(\\?v=\\w{10})?', 'g' ),

*/



