let _ = require('lodash');
let fs = require('fs');
let mkdirp = require('mkdirp');

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

const dataset = {};

walkSync('data/').map(
  ([file, depth]) => { 
    if (depth > 0 && depth <= 3) {
      const path = file.substring(0, file.lastIndexOf('/'));

      if (file.endsWith('categories.json')) {
        if (!dataset[path]) {
          //dataset[path] = 0;
        }
      } else {
        const text = fs.readFileSync(file);

        if (text.length === 0) {
          fs.unlinkSync(file);
          return;
        }

        const data = JSON.parse(text);
        const rows = data.query.categorymembers.length;
        dataset[path.substring(5) + '_cat'] = rows;
        let elements = path.split('/');
        for (let i = 0; i < elements.length; i++) {
           let token = elements.slice(1, i).join('/');
           dataset[token] = (dataset[token] || 0) + rows;
        }  
      }
      
    }
  }
)

console.log(JSON.stringify(dataset, null, 2));
