let dns = require('dns'),
    dnscache = require('dnscache')({
        "enable" : true,
        "ttl" : 3000,
        "cachesize" : 10000
    });
let https = require('https');
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
    ([file, depth]) => file.endsWith('pages.json')
  )
  .filter(
    ([file, depth]) => file.indexOf('/articles/') < 0
  )
  .map(
    ([file, depth]) => 
      JSON.parse(fs.readFileSync(file))
        .query
        .categorymembers
        .map(
          ({title}) => [title, file.substring(0, file.lastIndexOf('/')) + title + '.json']
        )
        .filter(
          ([title, path]) => !fs.existsSync(path)
        )
        .map(
          ([title, path]) => {
            setTimeout(
              function() {
                const parts = file.split('/');
                const cat = parts[parts.length - 2];
      
                let url = 'https://en.wikipedia.org/w/api.php?action=parse&format=json&page=' + title;
                const path = file.substring(0, file.lastIndexOf('/'));
                get(url, path, title, 1, () => {});
              },
              (i++) * 100)
          }
        )
 );


function get(url, path, type, retries, cb) {
  try { 
    console.log(url);
    const destFilename = path + '/articles/' + type.replace(/[\/]/g, '_') + '.json';

    if (fs.existsSync(destFilename)) {
      console.log('Cached ' + path);
      return cb([]);
    }
     
  let req = https.get(
    url,
    (res) => {
      let body = '';

      res.on('data', function(chunk){
        body += chunk;
      });

      res.on('end', function(){
        console.log('*' + body + '*');
        console.log('*' + path + '*');
       
        if (body.length === 0) {
          return;
        } 

        mkdirp(path + '/articles/', function(err) { 
          console.log(destFilename);
          fs.writeFileSync(
            destFilename,
            body
          )

          });
        });  
      }
    );

    req.on('error', () => {
      if (retries > 0) {
         return cb([_.partial(get, url, path, type, retries - 1)]);
      } else {
        return cb([]);
      }
    });
  } catch (e) {
  }
}


//'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmpagetitle=' + start + '&cmlimit=500'
