// @ts-expect-error hackable
process.stderr = {};
// @ts-expect-error hackable
process.stderr.fd = 2;

await import('./update.js');

export {};