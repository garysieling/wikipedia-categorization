let _ = require('lodash');
let fs = require('fs');
let mkdirp = require('mkdirp');

let start = 'Main_topic_classifications'

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

let retries = 50;
function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch(e) {
    return '';
  }
}

let i = 0;
walkSync('data/')
  .filter(
    ([file, depth]) => file.indexOf('/articles/') >= 0
  )
  .map(
    ([file, depth]) => {
      const body = fs.readFileSync(file, 'utf-8');
      //console.log(body);
      let data = null;
	    
      try {
	data = JSON.parse(body);
      } catch (e) {
	fs.unlinkSync(file);
	return;
      }

      if (data.error) {
	fs.unlinkSync(file);
	return;
      }
      //const dst = file.replace(/\/articles\//, '/pages/');
      //console.log(JSON.stringify(data, null, 2));
      //const text = data.parse.text['*'];
      //console.log(dst, text);
    }
  );

