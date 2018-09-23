let natural = require('natural');
let cmu = require('cmu-pronouncing-dictionary');
let _ = require('lodash');
let fs = require('fs');
let cheerio = require('cheerio');

let cmu_sounds = 
  _.fromPairs(
    _.toPairs(cmu)
     .map(
       ([k, v]) => [k, v.split(' ').join('_')]
     ));

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

const tokenizer = new natural.WordPunctTokenizer();

walkSync('data/')
  .filter(
    ([file, depth]) => file.match(/.txt$/)
  )
  .map(
    ([file, depth]) => {
      const body = fs.readFileSync(file, 'utf-8');
	    
      const dst = file.replace(/\.txt$/, '.sound');
      if (fs.existsSync(dst)) {
	return;
      }

      const path = dst.substring(0, dst.lastIndexOf('/'));
      
      const terms = tokenizer.tokenize(body.replace(/[()",:\[\]]/g, ' '));
      const sounds = terms.map( (term) => cmu_sounds[term] || term ).filter( (x) => x.length > 1 ).join(' ');

      fs.writeFileSync(dst, sounds);
    }
  );

