import path from 'node:path';
import fs from 'node:fs/promises';
import { constants } from 'node:fs';

export const existSync = async() => {
    try {
        await fs.access(`${path.resolve('..')}/activities/`, constants.R_OK | constants.W_OK);
        return true;
    } catch {
        return false;
    }
}