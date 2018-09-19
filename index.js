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
let url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:' + start + '&cmlimit=500'

let retries = 50;
function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch(e) {
    return '';
  }
}

function get(depth, url, path, type, retries, cb) {
  try { 
    console.log(url);
    const destFilename = path + '/' + type + '.json';

    if (fs.existsSync(destFilename)) {
      const json = JSON.parse(fs.readFileSync(destFilename, 'utf-8'));
      let more = 
        json.query.categorymembers.map(
          (cat) => cat.title
        ).map(
          (title) => 
            _.partial(
              get,
              depth + 1,
              'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=' + title + '&cmlimit=500&cmtype=subcat',
              path + '/' + title.split(':')[1],
              'categories',
              retries
            )
          );

      return cb(more);
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
        let json = tryParse(body);
       
        if (body.length === 0 || _.get(json, ['query', 'categorymembers'], '') === '') {
          if (retries > 0) {
            return cb([_.partial(get, depth, url, path, type, retries - 1)]);
          } else {
            return cb([]);
          }
        } 

        mkdirp(path, function(err) { 
          fs.writeFile(
            destFilename,
            body,
            cb
          )

            if (depth <= 5) {
              let more = 
                json.query.categorymembers.map(
                  (cat) => cat.title
                ).map(
                  (title) => 
                    _.partial(
                      get,
                      depth + 1,
                      'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=' + title + '&cmlimit=500&cmtype=subcat',
                      path + '/' + title.split(':')[1],
                      'categories',
                      retries
                    )
                  );

               cb(more)
             } else {
               cb([]);
             }
          });
        });  
      }
    );

    req.on('error', () => {
      if (retries > 0) {
         return cb([_.partial(get, depth, url, path, type, retries - 1)]);
      } else {
        return cb([]);
      }
    });
  } catch (e) {
    if (retries > 0) {
      return cb([_.partial(get, depth, url, path, type, retries - 1)]);
    } else {
      return cb([]);
    }
  }
}

function save(type, path, data, cb) {
}


requests = [_.partial(get, 0, url, 'data', 'categories', retries)];

function recurse(requests1, requests2) {
  let requests = requests1.concat(requests2 || []);
  if (requests.length === 0) { return; }

  _.delay(() => {
    if (requests1 && requests1.length > 0) {
      next = requests1.pop();
      next(
        _.partial(recurse, requests1)
      );
    }

    if (requests2 && requests2.length > 0) {
      next = requests2.pop();
      next(
        _.partial(recurse, requests2)
      );
    }
  }, 250);
}

recurse(requests);

//'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmpagetitle=' + start + '&cmlimit=500'
