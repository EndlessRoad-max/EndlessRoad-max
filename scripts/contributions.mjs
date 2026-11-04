import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const user = 'EndlessRoad-max';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
async function api(route) {
  const response = await fetch(`https://api.github.com${route}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'profile-contributions',
      ...(process.env.GITHUB_TOKEN ? {Authorization: `Bearer ${process.env.GITHUB_TOKEN}`} : {}) },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${route}`);
  return response.json();
}

export function summarize(prs, now = new Date()) {
  const unique = [...new Map(prs.map(p => [p.url, p])).values()];
  const merged = unique.filter(p => p.mergedAt);
  const months = Array.from({length:12}, (_, i) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    const key = date.toISOString().slice(0, 7);
    return {key, merged:merged.filter(p => p.mergedAt.startsWith(key)).length,
      open:unique.filter(p => p.state === 'open' && !p.mergedAt && p.createdAt.startsWith(key)).length};
  });
  const repos = [...new Set(unique.map(p => p.repo))].map(name => ({
    name, merged:merged.filter(p => p.repo === name).length,
    open:unique.filter(p => p.repo === name && p.state === 'open' && !p.mergedAt).length,
    stars:unique.find(p => p.repo === name).stars,
  })).sort((a,b) => b.merged-a.merged || b.open-a.open || a.name.localeCompare(b.name));
  return {updated:now.toISOString(), merged:merged.length, repositories:repos.length,
    recent:merged.filter(p => new Date(p.mergedAt) >= new Date(now.getTime()-30*86400000) && new Date(p.mergedAt)<=now).length,
    open:unique.filter(p => p.state === 'open' && !p.mergedAt).length, months, repos, prs:unique};
}

export function render(data, dark = false) {
  const colors = dark ? {bg:'#0d1117',text:'#e6edf3',muted:'#9da7b3',line:'#252c37',purple:'#b7a0ed',tint:'#201c30'}
    : {bg:'#ffffff',text:'#24242b',muted:'#737383',line:'#eeedf3',purple:'#8870bb',tint:'#f5f1fc'};
  const rows = data.repos.slice(0, 6);
  const height = 492 + Math.max(1, rows.length) * 54;
  const t = (x,y,txt,size=13,fill=colors.text,extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escape(txt)}</text>`;
  const line = y => `<path d="M32 ${y}H688" stroke="${colors.line}"/>`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="${height}" viewBox="0 0 720 ${height}" role="img" aria-labelledby="title desc">
  <title id="title">陈书研的公开开源贡献</title><desc id="desc">已合并 ${data.merged} 个 PR，参与 ${data.repositories} 个仓库，近 30 天合并 ${data.recent} 个 PR，待合并 ${data.open} 个。</desc>
  <rect width="720" height="${height}" rx="8" fill="${colors.bg}"/>
  <g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Microsoft YaHei,sans-serif">
  <circle cx="36" cy="34" r="3" fill="${colors.purple}"/>
  ${t(48,38,'OPEN SOURCE / CONTRIBUTIONS',10,colors.purple,'letter-spacing="1.6"')}
  ${t(32,84,user,28,colors.text,'font-weight="650"')}
  ${t(32,111,'记录每一次改进，也记录学习的过程。',13,colors.muted)}
  ${t(32,164,'MERGED PULL REQUESTS',10,colors.muted,'letter-spacing="1.3"')}
  ${t(32,216,data.merged,48,colors.text,'font-weight="650"')}
  ${t(32,242,'个公开 PR 已合并',13,colors.muted)}
  ${t(304,210,data.repositories,30,colors.text,'font-weight="600"')}
  ${t(304,238,'个仓库参与贡献',13,colors.muted)}
  ${t(548,210,`+${data.recent}`,30,colors.purple,'font-weight="600"')}
  ${t(548,238,'近 30 天合并',13,colors.muted)}
  ${line(268)}
  ${t(32,296,'近 12 个月',12,colors.muted)}
  <circle cx="457" cy="292" r="3" fill="${colors.purple}"/>${t(468,296,'已合并',11,colors.muted)}
  <circle cx="550" cy="292" r="3" fill="none" stroke="${colors.purple}"/>${t(561,296,'待合并（提交月）',11,colors.muted)}`;
  data.months.forEach((m,i) => {
    const x = 48 + i*56;
    const count = m.merged+m.open;
    svg += `<path d="M${x-12} 354h24" stroke="${colors.line}"/>`;
    for(let j=0;j<Math.min(count,12);j++) svg += `<circle cx="${x+(j%3-1)*8}" cy="${344-Math.floor(j/3)*9}" r="2.5" fill="${j<m.merged?colors.purple:colors.bg}" stroke="${colors.purple}"/>`;
    if(count>12) svg += t(x,305,count,10,colors.muted,'text-anchor="middle"');
    svg += t(x,376,m.key.slice(5),10,colors.muted,'text-anchor="middle"');
  });
  svg += t(32,403,`${data.months[0].key} — ${data.months.at(-1).key} · UTC`,10,colors.muted);
  svg += line(420) + t(32,447,'参与仓库',12,colors.muted) + t(688,447,'已合并 / 待合并 · Stars',11,colors.muted,'text-anchor="end"');
  if(!rows.length) svg += t(32,485,'公开贡献将从这里开始。',14,colors.muted);
  rows.forEach((r,i) => {
    const y=482+i*54;
    const name=r.name.length>43?r.name.slice(0,40)+'…':r.name;
    svg += `<circle cx="39" cy="${y-5}" r="8" fill="${colors.tint}"/><circle cx="39" cy="${y-5}" r="2.5" fill="${colors.purple}"/>`;
    svg += t(58,y,name,13,colors.text,'font-weight="550"') + t(688,y,`${r.merged} / ${r.open}  ·  ☆ ${new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(r.stars)}`,12,colors.muted,'text-anchor="end"');
    svg += line(y+20);
  });
  svg += t(32,height-16,`GitHub 公开数据 · 更新于 ${data.updated.slice(0,16).replace('T',' ')} UTC`,10,colors.muted);
  svg += '</g></svg>\n';
  return svg;
}

async function main() {
  const items=[];
  for(let page=1; ;page++) {
    const result=await api(`/search/issues?q=${encodeURIComponent(`is:pr author:${user} is:public -user:${user}`)}&per_page=100&page=${page}&sort=created&order=asc`);
    if(result.incomplete_results || result.total_count>1000) throw new Error('Search incomplete; keep last successful snapshot.');
    items.push(...result.items);
    if(items.length>=result.total_count) break;
    if(!result.items.length) throw new Error('Unexpected empty search page');
  }
  const prs=[];
  const repos=new Map();
  for(const item of items) {
    const name=item.repository_url.split('/repos/')[1];
    if(!repos.has(name)) repos.set(name,await api(`/repos/${name}`));
    const repo=repos.get(name);
    if(repo.private || repo.fork || repo.owner.login.toLowerCase()===user.toLowerCase()) continue;
    const pr=await api(`/repos/${name}/pulls/${item.number}`);
    if(pr.user.login.toLowerCase()!==user.toLowerCase()) continue;
    prs.push({repo:name,stars:repo.stargazers_count,url:pr.html_url,title:pr.title,number:pr.number,
      createdAt:pr.created_at,mergedAt:pr.merged_at,state:pr.state});
  }
  const data=summarize(prs);
  const readme=await readFile(path.join(root,'README.md'),'utf8');
  const marker=/<!-- contributions:start -->[\s\S]*?<!-- contributions:end -->/;
  if(!marker.test(readme)) throw new Error('README contribution markers missing');
  const recent=[...prs].sort((a,b)=>(b.mergedAt||b.createdAt).localeCompare(a.mergedAt||a.createdAt)).slice(0,5);
  const links=recent.map(p=>`- [${p.repo} #${p.number}](${p.url}) — ${p.mergedAt?'已合并':p.state==='open'?'待合并':'已关闭，未合并'}\n  ${p.title.replace(/[\r\n]/g,' ').replace(/[\\`*_{}\[\]<>]/g,'\\$&')}`).join('\n');
  const block=`<!-- contributions:start -->\n<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="assets/contributions-dark.svg">\n  <img src="assets/contributions.svg" alt="开源贡献：${data.merged} 个 PR 已合并，参与 ${data.repositories} 个仓库，${data.open} 个 PR 待合并" width="720">\n</picture>\n\n${links||'暂无公开 PR。'}\n\n<!-- contributions:end -->`;
  await mkdir(path.join(root,'assets'),{recursive:true});
  await writeFile(path.join(root,'assets/contributions.json'),JSON.stringify(data,null,2)+'\n');
  await writeFile(path.join(root,'assets/contributions.svg'),render(data));
  await writeFile(path.join(root,'assets/contributions-dark.svg'),render(data,true));
  await writeFile(path.join(root,'README.md'),readme.replace(marker,()=>block));
  console.log(JSON.stringify({merged:data.merged,repositories:data.repositories,open:data.open}));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(e=>{console.error(e.message);process.exitCode=1;});
