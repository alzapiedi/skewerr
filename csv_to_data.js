const fs = require('fs');

const csv = fs.readFileSync('data.csv').toString();
const rows = csv.split('\r\n');

const headers = rows[0].split(',');
let data = [];

for (let i = 1; i < rows.length; i++) {
  const row = rows[i].split(',');
  const entry = headers.reduce((acc, el, idx) => {
    acc[el] = row[idx];
    return acc;
  }, {});
  data.push(entry);
}

data = data.map(x => {
  return {
    ...x,
    vertical: parseInt(x.vertical),
    horizontal: parseInt(x.horizontal)
  }
});

fs.writeFileSync('data.json', JSON.stringify(data))
