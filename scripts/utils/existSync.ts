import { resolve } from 'node:path';
import { constants, existsSync } from 'node:fs';

export const existSync = (): boolean => {
    return existsSync(`${resolve('..')}/activities/`);
}