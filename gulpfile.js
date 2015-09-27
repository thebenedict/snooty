var gulp  = require('gulp'),
  gutil = require('gulp-util'),
  awspublish = require('gulp-awspublish'),
  imageResize = require('gulp-image-resize'),
  rename = require('gulp-rename'),
  path = require('path'),
  glob = require('glob'),
  fs = require('fs');

var posts = glob.sync('_posts/*').map(function(postName) {
  var name = path.basename(postName);
  return name.slice(11, name.indexOf('.')); //remove date prefix
}); 

posts.forEach(function(name) {
  gulp.task(name+'-images', function() {
    gutil.log('resizing images for: ', name);
    return gulp.src('images/'+name+'/*.jpg')
      .pipe(imageResize({
        width : 849,
        upscale : false
      }))
      .pipe(gulp.dest('images/'+name+'/thumbnails'))
  });
});

gulp.task('default', posts.map(function(name){ return name+'-images'; }));

gulp.task('publish-images', function() {
  var params = JSON.parse(fs.readFileSync('./config.json'));
  var publisher = awspublish.create(params);

  var headers = {
    'Cache-Control': 'max-age=315360000, no-transform, public'
  };

  return gulp.src('./images/**/*.jpg')
    // publisher will add Content-Length, Content-Type and headers specified above
    // If not specified it will set x-amz-acl to public-read by default
    .pipe(publisher.publish(headers))

    // create a cache file to speed up consecutive uploads
    .pipe(publisher.cache())

     // print upload updates to console
    .pipe(awspublish.reporter());
});