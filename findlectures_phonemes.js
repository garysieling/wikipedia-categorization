const async = require('async');
const fs = require('graceful-fs');
const _ = require('lodash');
const parquet = require('parquetjs');
const natural = require('natural');
const cmu = require('cmu-pronouncing-dictionary');

let cmu_sounds =
  _.fromPairs(
    _.toPairs(cmu)
     .map(
       ([k, v]) => [k, v.split(' ').join('_')]
     ));

const path = '/home/gary/Desktop/findlectures/json/1/';

const files = fs.readdirSync(path);

const tokenizer = new natural.WordPunctTokenizer();
function ph(text) {
  const terms = tokenizer.tokenize(text.replace(/[()",:\[\]]/g, ' '));
  const sounds = terms.map( (term) => cmu_sounds[term] || term ).filter( (x) => x.length > 1 ).join(' ');
  return sounds;
}

async function execute() {
  try {
    const schema = new parquet.ParquetSchema({ 
      id: { type: 'INT64' },
      text: { type: 'UTF8' }
    });

  return await parquet.ParquetWriter.openFile(schema, 'phonemes.parquet')
    .then(writer => {
      console.log('Starting...');	    
      //writer.setRowGroupSize(8192);
      let success = 0, fail = 0;  
      async.mapSeries(
	files,
        (file, cb) => {
          const data = JSON.parse(fs.readFileSync(path + file));
	  const text = data.transcript_s || data.auto_transcript_txt_en || data.description_s || data.speakerBio_txt || data.speakerBio_s || data.transcript_summary_txt || data.title_s;
          if (!text || !text.replace) {
            fail++; 
            console.log(success, fail);
            return cb()
	  }

          success++;
          const id = file.split('.')[0];
	  const row = {id: id, text: ph(text)};
          writer.appendRow(row).catch(
	    (e) => console.log("error", e)
	  ).then(() => {
            console.log(success, fail);
            cb();
	  }).catch(
            (e) => console.log("error 2", e, row)
	  )
        }, () => { console.log('Complete'); writer.close(); } )
    });

  } catch (e) {
	  console.log(e)
  }
}

execute().catch(
	console.log
);
