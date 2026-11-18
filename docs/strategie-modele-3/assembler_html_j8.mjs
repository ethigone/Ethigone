/** Assemble la livraison J8 ; conserve préparateur et manifest historiques J7. */
import fs from 'node:fs';
import path from 'node:path';
import {prepare,buildBundle,root} from './preparer_j8.mjs';
const pack=prepare();
pack.manifest={...pack.manifest,prepared_on:'2026-11-18',scope:'Livraison HTML J8 hors ligne',base_commit:'331ba846823715417fd52e367f2c484a5b97b2ea',html_completed:true,visual_browser_check:false};
fs.writeFileSync(path.join(root,'data/manifest-livraison-j8.json'),JSON.stringify(pack.manifest,null,2)+'\n');
fs.writeFileSync(path.join(root,'html/assets/donnees-et-moteurs.js'),buildBundle(pack));
console.log(JSON.stringify(pack.manifest.counts));
