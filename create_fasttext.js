const async = require('async');
const fs = require('graceful-fs');
const _ = require('lodash');

const test = 'test.txt'
const train = 'train.txt'

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
      let tag_history = '';
      for (let i = 1; i < tags.length - 2; i++) {
	if (tag_history !== '') { tag_history += '_' }
        tag_history += tags[i].replace(/[ '"/\\]/, '_');
        tag_list = tag_list + '__label__' + tag_history;
        //console.log(tags[i]);
      }
  
      if (Math.random() <= 0.1) {
        fs.appendFileSync('test.txt', tag_list + ' ' + body + '\n');
      } else {
        fs.appendFileSync('train.txt', tag_list + ' ' + body + '\n');
      }
    }
  );
