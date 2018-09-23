let _ = require('lodash');
let fs = require('fs');
let mkdirp = require('mkdirp');
let cheerio = require('cheerio');

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

      const dst = file.replace(/\.json$/, '.txt');
      if (fs.existsSync(dst)) {
	return;
      }

      const path = dst.substring(0, dst.lastIndexOf('/'));
      //console.log(JSON.stringify(data, null, 2));
      const text = data.parse.text['*'];
      //console.log(dst, text);
      const $ = cheerio.load(text);
      const innerText = 
        $('p').text()
         .replace(/\[edit\]/g, ' ')
         .replace(/\[citation needed\]/g, ' ')
         .replace(/\[[0-9]+\]/g, ' ')
         .replace(/[\n\r]/g, ' ');

      fs.writeFileSync(dst, innerText);
    }
  );

