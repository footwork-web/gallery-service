// node.js script for generating csv with mock data (for 10M product listings)

const fs = require('fs');
const { performance } = require('perf_hooks');

const lines = 10000000;
const filename = 'sdcData.csv';
const stream = fs.createWriteStream(filename);

const padNum = (number, size) => {
  const result = `0000${number}`;
  return result.substr(-size);
};

const writeLine = (id, listinId) => {
  const randomImgNumb = padNum(Math.ceil(Math.random() * 1000), 4);
  const url = `"https://sdc-gallery-images.s3-us-west-2.amazonaws.com/images/place${randomImgNumb}.jpg"\n`;
  return `${id},${listinId},${url}`;
};

const writeFile = (writeStream, encoding, done) => {
  let count = 1; // 10M
  let i = 0;
  function writing() {
    let canWrite = true;
    do {
      i += 1;
      // check progress
      if (i % 100000 === 0) console.log(i);
      const numbPics = Math.ceil(Math.random() * 5) + 2; // 3 to 7
      for (let j = 0; j < numbPics; j++) {
        const line = writeLine(count, i);
        count += 1;
        if (i === lines) {
          writeStream.write(line, encoding, done);
        } else {
          canWrite = writeStream.write(line, encoding);
        }
      }
    } while (i < lines && canWrite);
    if (i < lines && !canWrite) {
      writeStream.once('drain', writing);
    }
  }
  writing();
};

const t0 = performance.now();
stream.write('id,listing_id,img_url\n', 'utf-8');
writeFile(stream, 'utf-8', () => {
  stream.end();
  const t1 = performance.now();
  console.log('total time (s): ', (t1 - t0) / 1000);
});
