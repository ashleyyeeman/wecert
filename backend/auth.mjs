import {betterAuth} from 'better-auth';
import {Pool,neonConfig} from '@neondatabase/serverless';
import WebSocket from 'ws';
import {HttpsProxyAgent} from 'https-proxy-agent';

const proxy=process.env.HTTPS_PROXY||process.env.https_proxy;
neonConfig.webSocketConstructor=proxy?class extends WebSocket {constructor(address,protocols,options){super(address,protocols,{...options,agent:new HttpsProxyAgent(proxy)});}}:WebSocket;

let pool;
let auth;
export const appOrigin=()=>process.env.APP_ORIGIN||'http://localhost:3000';
export function getPool() {
  if(!process.env.DATABASE_URL)throw new Error('Database is not configured');
  const schema=process.env.DATABASE_SCHEMA||'wecert';
  if(!/^[a-z][a-z0-9_]{0,62}$/.test(schema))throw new Error('Invalid database schema');
  if(!pool){
    pool=new Pool({...(schema==='public'?{}:{options:'-c search_path='+schema+',public'}),connectionString:schema==='public'?process.env.DATABASE_URL:(process.env.DATABASE_URL_UNPOOLED||process.env.DATABASE_URL),max:5,idleTimeoutMillis:10000,connectionTimeoutMillis:15000});
    pool.on('error',error=>console.error('Database pool connection closed',{code:typeof error.code==='string'?error.code:'CONNECTION_CLOSED'}));
  }
  return pool;
}
export function getAuth() {
  if(!process.env.BETTER_AUTH_SECRET||process.env.BETTER_AUTH_SECRET.length<32)throw new Error('Authentication is not configured');
  return auth ||= betterAuth({
    appName:'WeCert',logger:{level:'error',log:level=>console.error('Authentication service event',{level})},database:getPool(),baseURL:appOrigin(),secret:process.env.BETTER_AUTH_SECRET,
    trustedOrigins:[appOrigin()],emailAndPassword:{enabled:true,minPasswordLength:12,maxPasswordLength:128},
    databaseHooks:{user:{create:{before:async user=>({data:{...user,name:String(user.name||'Student').trim().slice(0,40)||'Student'}})}}},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24,cookieCache:{enabled:false}},
    rateLimit:{enabled:true,storage:'database',window:60,max:60,customRules:{'/sign-in/email':{window:60,max:10},'/sign-up/email':{window:60,max:5}}},
    advanced:{cookiePrefix:'wecert',ipAddress:{ipAddressHeaders:['x-vercel-forwarded-for','x-real-ip','x-forwarded-for']},useSecureCookies:appOrigin().startsWith('https://')}
  });
}
export async function withTransaction(work) {
  const client=await getPool().connect();
  try {await client.query('BEGIN');const value=await work(client);await client.query('COMMIT');return value;}
  catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
