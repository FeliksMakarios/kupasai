/* Versioned, same-origin offline copies of pages explicitly saved by the learner. */
'use strict';
const CACHE='kupasai-offline-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('kupasai-offline-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
const allowed=url=>url.origin===self.location.origin&&url.pathname.startsWith('/kupasai/');
self.addEventListener('message',event=>{if(event.data?.type!=='save-page'||!event.ports[0])return;event.waitUntil((async()=>{try{const urls=event.data.urls;if(!Array.isArray(urls)||urls.length>60)throw Error('Daftar halaman tidak valid');const cache=await caches.open(CACHE);for(const raw of urls){const url=new URL(raw,self.location.origin);if(!allowed(url))throw Error('Sumber di luar situs');url.search='';url.hash='';const response=await fetch(url.href,{cache:'reload'});if(!response.ok)throw Error('Sebagian sumber tidak dapat diunduh');await cache.put(url.href,response);}event.ports[0].postMessage({ok:true});}catch(error){event.ports[0].postMessage({ok:false,message:error.message});}})());});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(!allowed(url))return;event.respondWith((async()=>{try{return await fetch(event.request);}catch(error){url.search='';url.hash='';const cached=await (await caches.open(CACHE)).match(url.href);if(cached)return cached;throw error;}})());});
