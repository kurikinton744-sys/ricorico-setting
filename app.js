(function () {
  'use strict';
  const data = window.RIKORIKO_DATA;
  const calculator = window.RicoricoCalculator;
  if (!data || !calculator) throw new Error('data.js / calculator.js が読み込めません。');
  const STORAGE_KEY = 'ricorico-setting-lab-v1';
  const $ = id => document.getElementById(id);
  const integerFormat = new Intl.NumberFormat('ja-JP');
  const rateFormat = v => String(Number((v*100).toFixed(6)));
  const idSet = new Set(data.items.map(it => it.id));
  const baseInputs = () => Object.fromEntries(data.items.map(it => [it.id,
    it.kind === 'categorical' ? {count:0} : {n:0,k:0}]));
  let state = {inputs:baseInputs(), overrides:{}};

  function safeStoredState(src) {
    const clean = {inputs:baseInputs(), overrides:{}};
    if (!src || typeof src !== 'object') return clean;
    for (const item of data.items) {
      const v = src.inputs?.[item.id];
      if (!v || typeof v !== 'object') continue;
      const fields = item.kind === 'categorical' ? ['count'] : ['n','k'];
      for (const field of fields) {
        if (typeof v[field] === 'number' && Number.isSafeInteger(v[field]) && v[field] >= 0) {
          clean.inputs[item.id][field] = v[field];
        }
      }
      const rates = src.overrides?.[item.id];
      if (Array.isArray(rates) && rates.length === 6 && rates.every(x => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 1)) {
        const restored = [...rates];
        // 前バージョンで保存した誤入力22%を、今回確定した2.2%に移行する。
        if (item.id === 'triggerDirect' && Math.abs(restored[4] - 0.22) < 1e-12) restored[4] = 0.022;
        if (!restored.every((value, i) => Math.abs(value - item.rates[i]) < 1e-12)) {
          clean.overrides[item.id] = restored;
        }
      }
    }
    return clean;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = safeStoredState(JSON.parse(raw));
  } catch (_) { /* No storage permissions or invalid old data: continue in memory. */ }

  function persist() {
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));$('save-state').textContent='端末内に自動保存';}
    catch (_) {$('save-state').textContent='保存不可（このタブのみ）';}
  }
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function buildGroupHeader(group) {
    const header = el('div','group-header');
    const row = el('div','group-header-title');
    row.append(el('span','group-icon',String(data.groups.findIndex(g => g.id===group.id)+1).padStart(2,'0')));
    row.append(el('h3','',group.label));
    header.append(row, el('p','',group.description));
    return header;
  }

  function makeField(item, field, description) {
    const fieldWrap = el('div','field');
    fieldWrap.append(el('span','field-caption',description));
    const control = el('div','counter');
    const input = document.createElement('input');
    input.type='number'; input.min='0'; input.step='1'; input.inputMode='numeric';
    input.dataset.item=item.id; input.dataset.field=field;
    input.setAttribute('aria-label', `${item.label} ${description}`);
    input.value = state.inputs[item.id][field] || '';
    input.placeholder = '0';
    const makeCounterButton = (delta, symbol, action) => {
      const button=el('button', `counter-button ${delta>0?'counter-plus':'counter-minus'}`, symbol);
      button.type='button';
      button.dataset.item=item.id;
      button.dataset.field=field;
      button.dataset.delta=String(delta);
      button.setAttribute('aria-label',`${item.label} ${description}を1${action}`);
      if (delta<0) button.disabled=!(state.inputs[item.id][field]>0);
      return button;
    };
    control.append(makeCounterButton(-1,'−','減らす'),input,makeCounterButton(1,'＋','増やす'));
    fieldWrap.append(control);
    return fieldWrap;
  }

  function syncItemControls(itemId, rewriteValues=false) {
    const values=state.inputs[itemId];
    const invalidPair=values.n!==undefined && values.k>values.n;
    for(const node of $('input-groups').querySelectorAll('[data-item]')) {
      if(node.dataset.item!==itemId) continue;
      const field=node.dataset.field;
      const value=values[field];
      if(node.matches('input')) {
        if(rewriteValues) node.value=String(value);
        node.setAttribute('aria-invalid',String(!Number.isSafeInteger(value)||value<0 || (invalidPair && field==='k')));
      } else if (node.matches('button[data-delta]')) {
        node.disabled = !Number.isSafeInteger(value) || (Number(node.dataset.delta)<0 ? value<=0 : value>=Number.MAX_SAFE_INTEGER);
      }
    }
  }

  function renderInputs() {
    const target = $('input-groups'); target.replaceChildren();
    for (const group of data.groups) {
      const section = el('section','group-card'); section.append(buildGroupHeader(group));
      const rows = el('div','input-rows');
      const items = data.items.filter(x=>x.group===group.id);
      for (const item of items) {
        const row = el('div','input-row'+(item.kind==='categorical'?' category-row':''));
        const label=el('div','input-label',item.kind==='binomial'?item.label.replace('駆け抜け ','').replace('通常 ','').replace('上位 ',''):item.label);
        if (item.kind==='binomial') {
          row.append(label,makeField(item,'n','試行回数'),makeField(item,'k','当選回数'));
        } else if (item.kind==='bell') {
          row.append(label,makeField(item,'n','総ゲーム数'),makeField(item,'k','成立回数'));
        } else {
          row.append(label,makeField(item,'count','出現回数'));
        }
        rows.append(row);
      }
      section.append(rows); target.append(section);
    }
  }

  function renderRates() {
    const target=$('rate-groups'); target.replaceChildren();
    for (const group of data.groups) {
      const section=el('section','group-card');section.append(buildGroupHeader(group));
      const wrap=el('div','rate-table-scroll');const table=el('table','rate-table');
      const head=document.createElement('thead');const hrow=document.createElement('tr');
      for(const label of ['項目','設定1','設定2','設定3','設定4','設定5','設定6']) hrow.append(el('th','',label));
      head.append(hrow);table.append(head);
      const body=document.createElement('tbody');
      for(const item of data.items.filter(it=>it.group===group.id)) {
        const row=document.createElement('tr'); const name=document.createElement('td');
        name.append(el('span','rate-label',item.label),el('small','',item.source));row.append(name);
        const values=calculator.effectiveRates(item,state.overrides);
        for(let s=0;s<6;s++) {
          const td=document.createElement('td');
          const input=document.createElement('input'); input.type='number';input.step='0.001';input.min='0';input.max='100';input.inputMode='decimal';
          input.className='rate-input'+(state.overrides[item.id]&&Math.abs(values[s]-item.rates[s])>1e-12?' changed':'');
          input.dataset.rateItem=item.id; input.dataset.setting=String(s); input.value=rateFormat(values[s]);
          input.setAttribute('aria-label',`${item.label} 設定${s+1}の確率（%）`);
          td.append(input);row.append(td);
        }
        body.append(row);
      }
      table.append(body);wrap.append(table);section.append(wrap);target.append(section);
    }
  }

  function setAlertContents(result) {
    const target=$('alerts'); target.replaceChildren();
    const seen=new Set();
    for(const issue of result.issues) {
      if(seen.has(issue.message)) continue;seen.add(issue.message);
      const alert=el('div','alert');alert.append(el('strong','', '要確認：'),document.createTextNode(issue.message));
      target.append(alert);
      if(seen.size>=6) break;
    }
  }

  function formatPct(prob) { return `${(100*prob).toFixed(1)}%`; }
  function refresh() {
    const result=calculator.calculate(data,state.inputs,state.overrides);
    setAlertContents(result);
    const posterior=result.posterior;
    const bars=$('setting-bars');bars.replaceChildren();
    const maximum=posterior?Math.max(...posterior):0;
    const leaders=posterior?posterior.map((p,i)=>Math.abs(p-maximum)<1e-10?i+1:null).filter(Boolean):[];
    $('result-state').textContent=result.inconsistent?'入力矛盾':result.isEmpty?'未入力':'入力反映中';
    $('best-setting').textContent=result.inconsistent?'—':result.isEmpty?'—':(leaders.length===1?`設定${leaders[0]}`:'同率');
    $('high-prob').textContent=posterior?formatPct(posterior.slice(3).reduce((a,b)=>a+b,0)):'—';
    $('top-prob').textContent=posterior?formatPct(posterior.slice(4).reduce((a,b)=>a+b,0)):'—';
    $('sample-count').textContent=integerFormat.format(result.observations);
    for(let s=0;s<6;s++) {
      const p=posterior?posterior[s]:0;
      const row=el('div','setting-bar'+(!result.isEmpty&&p>0&&Math.abs(p-maximum)<1e-10?' leading':''));
      row.append(el('span','setting-bar-label',`設定${s+1}`));
      const track=el('div','bar-track');track.setAttribute('role','progressbar');track.setAttribute('aria-label',`設定${s+1}の推測割合`);track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String((100*p).toFixed(1)));
      const fill=el('div','bar-fill');fill.style.width=`${p*100}%`;track.append(fill);
      row.append(track,el('span','bar-number',posterior?formatPct(p):'—'));bars.append(row);
    }
    $('result-help').textContent = result.inconsistent
      ? '入力内容と確率表を確認してください。矛盾した入力からは推測割合を出せません。'
      : result.isEmpty ? 'まだ計算可能な観測データがありません。初期値は設定1〜6を等確率（16.7%ずつ）としています。'
      : `${result.usedGroups.length}種類のグループ・${result.usedIndicators}指標を使用。これは確率モデル上の相対的な推測割合です。設定が確定するものではありません。`;
  }

  function importNumber(input) {
    return input.value.trim()===''?0:Number(input.value);
  }
  $('input-groups').addEventListener('input',event=>{
    const target=event.target;if(!target.matches('input[data-item]'))return;
    const item=target.dataset.item,field=target.dataset.field;
    state.inputs[item][field]=importNumber(target);
    syncItemControls(item);
    if(Number.isFinite(state.inputs[item][field])) persist();
    refresh();
  });

  // ＋/−はキーボード不要のカウンター。タップごとに1増減して即時計算・保存。
  $('input-groups').addEventListener('click',event=>{
    const button=event.target.closest('button[data-delta]');
    if(!button || !$('input-groups').contains(button) || button.disabled)return;
    const item=button.dataset.item,field=button.dataset.field,delta=Number(button.dataset.delta);
    const current=state.inputs[item][field];
    if(!Number.isSafeInteger(current) || current<0)return;
    const next=current+delta;
    if(next<0 || !Number.isSafeInteger(next))return;
    state.inputs[item][field]=next;
    syncItemControls(item,true);
    persist();refresh();
  });

  $('rate-groups').addEventListener('change',event=>{
    const input=event.target;if(!input.matches('input[data-rate-item]'))return;
    const id=input.dataset.rateItem,s=Number(input.dataset.setting),percentage=input.value.trim()===''?NaN:Number(input.value);
    if(!Number.isFinite(percentage)||percentage<0||percentage>100){
      input.classList.add('invalid');input.setAttribute('aria-invalid','true');return;
    }
    const item=data.items.find(it=>it.id===id);
    const values=[...calculator.effectiveRates(item,state.overrides)];values[s]=percentage/100;
    if(values.every((v,i)=>Math.abs(v-item.rates[i])<1e-12)) delete state.overrides[id];
    else state.overrides[id]=values;
    input.classList.remove('invalid');input.setAttribute('aria-invalid','false');
    input.classList.toggle('changed',Math.abs(values[s]-item.rates[s])>1e-12);
    input.value=rateFormat(values[s]);persist();refresh();
  });

  for(const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click',()=>{
      const active=tab.dataset.tab;
      for(const button of document.querySelectorAll('.tab')){
        const yes=button.dataset.tab===active;button.classList.toggle('active',yes);button.setAttribute('aria-selected',String(yes));
      }
      $('tab-input').hidden=active!=='input';$('tab-rates').hidden=active!=='rates';
    });
  }
  $('clear-inputs').addEventListener('click',()=>{
    if(!confirm('実戦データの入力をすべて消去しますか？（設定別確率の編集は残ります）'))return;
    state.inputs=baseInputs();persist();renderInputs();refresh();
  });
  $('reset-rates').addEventListener('click',()=>{
    if(!confirm('編集した確率をすべてExcel初期値に戻しますか？'))return;
    state.overrides={};persist();renderRates();refresh();
  });
  $('download-data').addEventListener('click',()=>{
    const payload={schema:1,exportedAt:new Date().toISOString(),title:data.title,inputs:state.inputs,overrides:state.overrides};
    const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='ricorico-setting-record.json';document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('load-data').addEventListener('click',()=>$('import-file').click());
  $('import-file').addEventListener('change',async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{
      const imported=JSON.parse(await file.text());
      if(imported.schema!==1||!imported.inputs||typeof imported.inputs!=='object'||!imported.overrides||typeof imported.overrides!=='object'){
        throw new Error('本アプリの保存データ（schema: 1）ではありません。');
      }
      if(!confirm('現在の実戦データと確率の編集を、読み込んだデータで上書きしますか？'))return;
      state=safeStoredState(imported);persist();renderInputs();renderRates();refresh();
    }catch(err){alert(`読み込みできません：${err.message}`)}
    finally{event.target.value='';}
  });
  renderInputs();renderRates();refresh();
})();
