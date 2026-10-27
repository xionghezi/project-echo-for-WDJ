import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
// Short path avoids Windows SQLite MAX_PATH failures in deeply nested checkouts.
export const localState = resolve(process.env.ECHO_LOCAL_STATE || join(tmpdir(), 'project-echo-local'));
