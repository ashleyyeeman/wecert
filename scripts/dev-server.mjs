import 'dotenv/config';
import {serve} from '@hono/node-server';
import {serveStatic} from '@hono/node-server/serve-static';
import app from '../server.mjs';
app.get('*',serveStatic({root:'./public'}));
const port=Number(process.env.PORT||3000);
serve({fetch:app.fetch,port},()=>console.log('WeCert server listening on '+port));
