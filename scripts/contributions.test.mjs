import { test } from 'node:test';
import assert from 'node:assert/strict';
import {summarize,render} from './contributions.mjs';
test('counts merged separately from open and closed, deduplicates PRs and handles year boundary',()=>{
 const p={repo:'org/a',stars:100,url:'https://github.com/org/a/pull/1',createdAt:'2025-12-01T00:00:00Z',mergedAt:'2025-12-28T00:00:00Z',state:'closed'};
 const data=summarize([p,p,{...p,url:'2',mergedAt:null,state:'open'},{...p,url:'3',mergedAt:null}],new Date('2026-01-04T00:00:00Z'));
 assert.equal(data.merged,1);assert.equal(data.open,1);assert.equal(data.recent,1);assert.equal(data.repositories,1);
 assert.equal(data.months[0].key,'2025-02');assert.equal(data.months.at(-2).merged,1);assert.equal(data.months.at(-2).open,1);
});
test('empty and long repository names render safely in both themes',()=>{
 const empty=summarize([],new Date('2026-01-04T00:00:00Z'));
 assert.match(render(empty),/公开贡献将从这里开始/);
 const data=summarize([{repo:'org/<script>&'+'a'.repeat(80),stars:1,url:'1',createdAt:'2026-01-01',mergedAt:null,state:'open'}]);
 for(const dark of [false,true]){const svg=render(data,dark);assert.ok(!svg.includes('<script>'));assert.ok(svg.includes('&lt;script&gt;'));assert.ok(!svg.includes('NaN'));}
});
