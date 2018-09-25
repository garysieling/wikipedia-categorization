const async = require('async');
const fs = require('graceful-fs');
const _ = require('lodash');

let walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push([dir + file, dir.split('/').length - 2]);
    }
  });
  return filelist;
};

walkSync('data/')
  .filter(
    ([file, depth]) => file.match(/\.sound$/)
  )
  .map(
    ([file, depth]) => {
      const body = fs.readFileSync(file, 'utf-8');
      //console.log(body);
      let data = null;
      let tags = file.split('/');
      let tag_list = '';
      for (let i = 1; i < tags.length - 2; i++) {
        tag_list = tag_list + '__label__' + tags[i].replace(/[ '"/\\]/, '_') + ' ';
        //console.log(tags[i]);
      }
      
      console.log(tag_list + ' ' + body);
    }
  );
