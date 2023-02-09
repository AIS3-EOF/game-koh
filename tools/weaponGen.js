
var input = `
-XXXXXX
-OXXXXX
-XXXXXX
`.trim();

var origin = input.split('\n')
    .map(
        (line, y) =>
            line.split('')
                .map((char, x) => char === 'O' ? [y, x] : null)
                .filter(Boolean)
    ).reduce((a, b) => a.concat(b), [])[0];

var output = input.split('\n').map((line, y) => {
    return line.split('').map((char, x) => {
        if (char === 'X') {
            return [y - origin[0], x - origin[1]];
        }
    }).filter(Boolean);
}
).reduce((a, b) => a.concat(b), []);

console.log(JSON.stringify(output));
