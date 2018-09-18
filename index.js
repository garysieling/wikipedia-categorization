let https = require('https');
let _ = require('lodash');
let fs = require('fs');
let mkdirp = require('mkdirp');

let start = 'Main_topic_classifications'
let url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:' + start + '&cmlimit=500'

function get(url, path, type, cb) {
  console.log(url);
  https.get(
    url,
    (res) => {
      let body = '';

      res.on('data', function(chunk){
        body += chunk;
      });

      res.on('end', function(){
        let json = JSON.parse(body);
       
        mkdirp(path, function(err) { 
          fs.writeFile(
            path + '/' + type + '.json',
            body,
            cb
          )

          console.log(body);

          let more = 
            json.query.categorymembers.map(
              (cat) => cat.title
            ).map(
              (title) => 
                _.partial(
                  get,
                  'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=' + title + '&cmlimit=500&cmtype=subcat',
                  path + '/' + title.split(':')[1],
                  'categories'
                )
            );

           cb(more)
        });
      });  
    }
  )
}

function save(type, path, data, cb) {
}


requests = [_.partial(get, url, 'data', 'categories')];

function recurse(requests1, requests2) {
  let requests = requests1.concat(requests2 || []);
  if (requests.length === 0) { return; }

  next = requests.pop();
console.log(next);
  next(
    _.partial(recurse, requests)
  );
}

recurse(requests);

//'https://en.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtype=subcat&cmpagetitle=' + start + '&cmlimit=500'
