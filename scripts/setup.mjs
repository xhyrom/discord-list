process.stderr = {};
process.stderr.fd = 2;

await import('./update.mjs');