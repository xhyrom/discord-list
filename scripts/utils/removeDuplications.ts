// Use bun for running this script
// $ bun utils/removeDuplications.ts

import { join } from 'path';

const content = (await Bun.file(join('..', 'guilds', 'README.md')).text())
    .split('\n');

const newContent = [...new Set(content)];
console.log(content.length, newContent.length);