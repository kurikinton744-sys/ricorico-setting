/* Pure probability engine: works in the browser and Node.js, no dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RicoricoCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SETTINGS = 6;
  const SUM_TOLERANCE = 0.0025; // Excel's percentages are rounded to ~0.1pp.

  function effectiveRates(item, overrides = {}) {
    const override = overrides[item.id];
    return Array.isArray(override) && override.length === SETTINGS ? override : item.rates;
  }

  function modelIssues(data, overrides = {}) {
    const issues = [];
    for (const item of data.items) {
      const rates = effectiveRates(item, overrides);
      if (rates.length !== SETTINGS || rates.some(p => !Number.isFinite(p) || p < 0 || p > 1)) {
        issues.push({ group: item.group, message: `${item.label}の設定別確率に0〜100%以外の値があります。` });
      }
    }
    for (const group of data.groups) {
      const items = data.items.filter(it => it.group === group.id);
      if (!items.length || items[0].kind !== 'categorical') continue;
      const bad = [];
      for (let s = 0; s < SETTINGS; s++) {
        const total = items.reduce((sum, it) => sum + Number(effectiveRates(it, overrides)[s] ?? NaN), 0);
        if (!Number.isFinite(total) || Math.abs(total - 1) > SUM_TOLERANCE) {
          bad.push(`設定${s+1}: ${(total*100).toFixed(1)}%`);
        }
      }
      if (bad.length) issues.push({group: group.id,
        message: `${group.label}の確率合計が100%になっていません（${bad.join('、')}）。このグループの結果は設定推測から除外します。`});
    }
    return issues;
  }

  function trialLogProbability(n, k, p) {
    // The binomial coefficient does not depend on setting and cancels in Bayes normalization.
    if (p === 0) return k > 0 ? -Infinity : 0;
    if (p === 1) return n > k ? -Infinity : 0;
    return k * Math.log(p) + (n-k) * Math.log1p(-p);
  }

  function categoryLogProbability(count, p) {
    if (!count) return 0;
    if (p === 0) return -Infinity;
    return count * Math.log(p);
  }

  function validInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
  }

  function calculate(data, inputs = {}, overrides = {}) {
    const issues = modelIssues(data, overrides);
    const invalidGroups = new Set(issues.map(x => x.group));
    const logs = Array(SETTINGS).fill(0);
    const usedGroups = new Set();
    let observations = 0;
    let usedIndicators = 0;

    for (const item of data.items.filter(it => it.kind === 'binomial' || it.kind === 'bell')) {
      const input = inputs[item.id] || {};
      const n = input.n ?? 0, k = input.k ?? 0;
      if (!validInteger(n) || !validInteger(k) || k > n) {
        issues.push({group:item.group, message:`${item.label}の入力が不正です。当選回数は試行回数以下の0以上の整数にしてください。`});
        continue;
      }
      if (!n || invalidGroups.has(item.group)) continue;
      usedGroups.add(item.group);
      observations += n;
      usedIndicators++;
      const rates = effectiveRates(item, overrides);
      for (let s=0;s<SETTINGS;s++) logs[s] += trialLogProbability(n,k,rates[s]);
    }

    for (const group of data.groups) {
      const items = data.items.filter(it => it.group === group.id && it.kind === 'categorical');
      if (!items.length) continue;
      const counts = items.map(it => (inputs[it.id] || {}).count ?? 0);
      if (counts.some(count => !validInteger(count))) {
        issues.push({group:group.id,message:`${group.label}の回数は0以上の整数で入力してください。`});
        continue;
      }
      const total = counts.reduce((a,b)=>a+b,0);
      if (!total || invalidGroups.has(group.id)) continue;
      observations += total;
      usedGroups.add(group.id);
      usedIndicators += counts.filter(n=>n>0).length;
      for (let s=0;s<SETTINGS;s++) {
        for (let i=0;i<items.length;i++) {
          logs[s] += categoryLogProbability(counts[i],effectiveRates(items[i],overrides)[s]);
        }
      }
    }

    if (!observations) {
      return {posterior:Array(SETTINGS).fill(1/SETTINGS),logs,issues,observations,usedIndicators,
        usedGroups:[...usedGroups],isEmpty:true,inconsistent:false};
    }
    const peak = Math.max(...logs);
    if (!Number.isFinite(peak)) {
      issues.push({group:'input', message:'現在の観測結果は、全設定で発生確率0の組み合わせです。入力内容や確率表を確認してください。'});
      return {posterior:null,logs,issues,observations,usedIndicators,usedGroups:[...usedGroups],isEmpty:false,inconsistent:true};
    }
    const scaled = logs.map(log => Math.exp(log - peak));
    const sum = scaled.reduce((a,b)=>a+b,0);
    return {posterior:scaled.map(v=>v/sum),logs,issues,observations,usedIndicators,
      usedGroups:[...usedGroups],isEmpty:false,inconsistent:false};
  }
  return {calculate, modelIssues, effectiveRates, trialLogProbability, categoryLogProbability};
});
