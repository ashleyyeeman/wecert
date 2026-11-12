import 'dotenv/config';
import {getMigrations} from 'better-auth/db/migration';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {getAuth,getPool} from '../backend/auth.mjs';

for(const key of ['DATABASE_URL','BETTER_AUTH_SECRET','APP_ORIGIN','BOOTSTRAP_TEACHER_CODE'])if(!process.env[key])throw new Error('Missing configuration: '+key);
const pool=getPool();const client=await pool.connect();
try {
  await client.query('SELECT pg_advisory_lock(461132810)');
  const schema=process.env.DATABASE_SCHEMA||'wecert';
  if(!/^[a-z][a-z0-9_]{0,62}$/.test(schema))throw new Error('Invalid database schema');
  await client.query('CREATE SCHEMA IF NOT EXISTS "'+schema+'"');
  const migrations=await getMigrations(getAuth().options);await migrations.runMigrations();
  await client.query('BEGIN');
  await client.query(await readFile(new URL('../backend/schema.sql',import.meta.url),'utf8'));
  await client.query("INSERT INTO wc_setup_keys(name,token_hash) VALUES('first-teacher',$1) ON CONFLICT DO NOTHING",[createHash('sha256').update(process.env.BOOTSTRAP_TEACHER_CODE).digest('hex')]);
  await client.query('COMMIT');console.log('Authentication and classroom schema ready.');
} catch(error){await client.query('ROLLBACK');console.error('Schema migration failed',{code:typeof error.code==='string'?error.code:'MIGRATION_ERROR'});process.exitCode=1;}
finally{await client.query('SELECT pg_advisory_unlock(461132810)');client.release();await pool.end();}
