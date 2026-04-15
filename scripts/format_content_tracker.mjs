import { spawnSync } from 'node:child_process';

const GOG = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const SHEET = '1ILrr0xFBmm5G2tzdn_6Yh9XyF-IdmsAmRQNd6Tdq1Gg';

const calls = [
  {
    range: "'content tracker'!A1:N1",
    format: {
      backgroundColor: { red: 0.12, green: 0.12, blue: 0.12 },
      textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
      horizontalAlignment: 'CENTER'
    },
    fields: 'backgroundColor,textFormat,horizontalAlignment'
  },
  {
    range: "'content tracker'!A2:N200",
    format: {
      wrapStrategy: 'WRAP',
      verticalAlignment: 'MIDDLE'
    },
    fields: 'wrapStrategy,verticalAlignment'
  }
];

for (const call of calls) {
  const res = spawnSync(GOG, [
    'sheets', 'format',
    SHEET,
    call.range,
    '--format-json', JSON.stringify(call.format),
    '--format-fields', call.fields,
  ], { stdio: 'pipe', encoding: 'utf8' });

  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if ((res.status ?? 1) !== 0) process.exit(res.status ?? 1);
}
