/**
 * AI / NLP Engine for SIF (Serious Injury & Fatality) Precursor Detection
 * Tailored for Oil India Limited (OIL) Health, Safety, Security & Environment (HSSE)
 */

export const IOGP_LIFE_SAVING_RULES = [
  { id: 'Energy Isolation', keywords: ['loto', 'isolation', 'lockout', 'tagout', 'pressure', 'bleed', 'blind'] },
  { id: 'Hot Work', keywords: ['welding', 'grinding', 'hot work', 'spark', 'fire', 'combustible'] },
  { id: 'Confined Space', keywords: ['confined', 'vessel', 'tank', 'trench', 'ventilation', 'gas test', 'h2s', 'asphyxiation'] },
  { id: 'Line of Fire', keywords: ['dropped', 'falling', 'crush', 'pinch', 'struck by', 'tension'] },
  { id: 'Working at Height', keywords: ['height', 'fall', 'harness', 'scaffold', 'roof', 'ladder', 'monkey board', 'derrick'] },
  { id: 'Driving', keywords: ['vehicle', 'driving', 'speed', 'seatbelt', 'collision', 'truck'] },
  { id: 'Lifting Operations', keywords: ['crane', 'lift', 'hoist', 'sling', 'suspended load', 'winch'] },
  { id: 'Bypassing Safety Controls', keywords: ['bypassed', 'disabled', 'overridden', 'removed guard', 'interlock'] },
  { id: 'Fit for Duty', keywords: ['fatigue', 'alcohol', 'drugs', 'exhausted', 'impairment'] },
  { id: 'Work Authorization', keywords: ['permit', 'ptw', 'unauthorized', 'no permit', 'without permit'] }
];

export const PRECURSOR_KEYWORDS = {
  hazards: ['toxic gas', 'h2s', 'high pressure', 'live wire', 'suspended load', 'explosive', 'combustible', 'rotating equipment'],
  acts: ['entered without testing', 'bypassed', 'not using harness', 'standing under load', 'ignored warning', 'no ptw', 'no permit'],
  conditions: ['no atmospheric verification', 'gas testing not completed', 'frayed wire', 'missing guard', 'unsecured', 'leak'],
  barriers: ['gas testing', 'permit to work', 'isolation', 'fall protection', 'ppe', 'barricade', 'loto', 'communication'],
  equipment: ['gas detector', 'crane', 'valve', 'scaffold', 'harness', 'pump', 'compressor', 'derrick', 'drill pipe']
};

/**
 * 1. SIF-Potential Classification
 */
export function classifySIF(text) {
  if (!text) return { isSifPotential: false, confidenceScore: 0, priorityScore: 0, secondaryRiskIndex: 0 };
  
  const lowerText = text.toLowerCase();
  
  // SIF signals typically involve high energy or fatal consequences
  const sifSignals = ['fatal', 'death', 'fall', 'h2s', 'high pressure', 'explosion', 'suspended load', 'crush', 'toxic', 'unconscious', 'loto', 'bypassed', 'without harness', 'no gas test'];
  
  let signalCount = 0;
  sifSignals.forEach(signal => {
    if (lowerText.includes(signal)) signalCount++;
  });

  const isSifPotential = signalCount >= 1;
  const confidenceScore = isSifPotential ? Math.min(65 + (signalCount * 12), 98) : Math.max(12, 45 - (signalCount * 10));
  const priorityScore = isSifPotential ? confidenceScore : Math.floor(confidenceScore / 2);
  const secondaryRiskIndex = isSifPotential ? Math.min(confidenceScore + 10, 100) : 25;

  return { isSifPotential, confidenceScore, priorityScore, secondaryRiskIndex };
}

/**
 * 2. Life-Saving Rule Mapping
 */
export function mapLifeSavingRule(text) {
  const lowerText = text.toLowerCase();
  let mappedRules = [];

  IOGP_LIFE_SAVING_RULES.forEach(rule => {
    const matchedKeywords = rule.keywords.filter(kw => lowerText.includes(kw));
    if (matchedKeywords.length > 0) {
      mappedRules.push({
        rule: rule.id,
        confidence: Math.min(70 + (matchedKeywords.length * 10), 99),
        evidence: matchedKeywords
      });
    }
  });

  return mappedRules.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 3. Precursor Extraction
 */
export function extractPrecursors(text) {
  const lowerText = text.toLowerCase();
  
  const extractMatches = (category) => {
    return PRECURSOR_KEYWORDS[category].filter(kw => lowerText.includes(kw)) || [];
  };

  const hazards = extractMatches('hazards');
  const acts = extractMatches('acts');
  const conditions = extractMatches('conditions');
  const barriers = extractMatches('barriers');
  const equipment = extractMatches('equipment');

  // Infer failures
  let barrierFailures = [];
  if (acts.includes('no ptw') || acts.includes('no permit')) barrierFailures.push('Permit Verification Failure');
  if (lowerText.includes('no gas test') || lowerText.includes('without testing')) barrierFailures.push('Missing Gas Testing');
  if (lowerText.includes('isolation') && (lowerText.includes('failed') || lowerText.includes('no'))) barrierFailures.push('Incomplete Energy Isolation');
  if (lowerText.includes('harness') && (lowerText.includes('without') || lowerText.includes('no'))) barrierFailures.push('PPE Non-Compliance');

  return {
    activity: 'General Operations', // Simplified for demo, could be inferred from context
    location: 'OIL Facility',
    equipment: equipment.length ? equipment[0] : 'General Equipment',
    hazard: hazards.length ? hazards[0] : 'Standard Hazard',
    unsafeAct: acts.length ? acts[0] : 'N/A',
    unsafeCondition: conditions.length ? conditions[0] : 'N/A',
    barrierFailures: barrierFailures.length ? barrierFailures : ['N/A'],
    potentialConsequence: hazards.length ? 'Serious Injury/Fatality' : 'Minor Incident'
  };
}

/**
 * 4. Explainable AI
 */
export function getWhyFlaggedExplanation(classification, rules, precursors) {
  if (!classification.isSifPotential) return "Incident lacks high-energy severity signals or critical barrier failures.";
  
  let explanation = `**SIF-Potential — ${classification.confidenceScore}%**\n\n**Key signals:**\n`;
  rules.forEach(r => {
    r.evidence.forEach(ev => explanation += `- "${ev}"\n`);
  });

  explanation += `\n**Detected:**\n`;
  explanation += `**Hazard:** ${precursors.hazard}\n`;
  explanation += `**Barrier Failure:** ${precursors.barrierFailures.join(', ')}\n`;
  if (rules.length > 0) {
    explanation += `**LSR:** ${rules[0].rule}`;
  }

  return explanation;
}

/**
 * 5. Main Analysis Pipeline
 */
export function analyzeSafetyReport(text) {
  const classification = classifySIF(text);
  const rules = mapLifeSavingRule(text);
  const precursors = extractPrecursors(text);
  const explanation = getWhyFlaggedExplanation(classification, rules, precursors);

  // Derive high energy types & missing controls & mitigations for DirectiveModal compatibility
  const lowerText = (text || '').toLowerCase();
  const detectedEnergies = [];
  if (precursors.hazard.includes('h2s') || precursors.hazard.includes('toxic') || lowerText.includes('h2s') || lowerText.includes('gas')) {
    detectedEnergies.push({ id: 'chem', label: 'Chemical / Toxic Gas (H2S)' });
  }
  if (rules.some(r => r.rule === 'Working at Height') || lowerText.includes('height') || lowerText.includes('harness') || lowerText.includes('derrick')) {
    detectedEnergies.push({ id: 'grav', label: 'Gravity / Fall from Height' });
  }
  if (rules.some(r => r.rule === 'Energy Isolation') || lowerText.includes('loto') || lowerText.includes('pressure') || lowerText.includes('flange')) {
    detectedEnergies.push({ id: 'press', label: 'Pressure & Energy Release' });
  }
  if (rules.some(r => r.rule === 'Lifting Operations') || lowerText.includes('crane') || lowerText.includes('suspended') || lowerText.includes('hoist')) {
    detectedEnergies.push({ id: 'mech', label: 'Mechanical / Suspended Load' });
  }
  if (rules.some(r => r.rule === 'Hot Work') || lowerText.includes('welding') || lowerText.includes('spark') || lowerText.includes('grinding')) {
    detectedEnergies.push({ id: 'therm', label: 'Thermal / Hot Work Spark' });
  }
  if (detectedEnergies.length === 0) {
    detectedEnergies.push({ id: 'gen', label: 'Operational Hazard Exposure' });
  }

  const missingControls = precursors.barrierFailures.filter(b => b !== 'N/A');
  if (missingControls.length === 0) {
    if (rules.length > 0) missingControls.push(`${rules[0].rule} Non-Compliance`);
    else missingControls.push('Standard Safeguard Omission');
  }

  const mitigations = [
    `Issue immediate Work-Stop Order for non-compliant activity until risk assessment is verified by HSE Lead.`,
    `Enforce mandatory ${rules.length > 0 ? rules[0].rule : 'IOGP Life-Saving Rule'} protocols and inspect barrier controls (${missingControls.join(', ')}).`,
    `Conduct mandatory Tool Box Talk (TBT) with shift crew at facility before resuming operations.`,
    `Log incident in OIL HSSE Central Portal with formal corrective actions and follow-up audit deadline.`
  ];

  return {
    rawText: text,
    analyzedAt: new Date().toISOString(),
    ...classification,
    mappedRules: rules,
    extractedPrecursors: precursors,
    explanation,
    reviewStatus: 'PENDING_REVIEW',

    // Helper aliases for total component compatibility across Executive Dashboard, Risk Analytics, and Directive Modal
    isSifPrecursor: classification.isSifPotential,
    sifProbability: classification.confidenceScore,
    severityLevel: classification.isSifPotential ? 'CRITICAL SIF PRECURSOR' : 'STANDARD SAFETY OBSERVATION',
    rootCause: rules.length > 0 ? rules[0].rule : (precursors.hazard || 'Operational Hazard'),
    detectedEnergies,
    missingControls,
    mitigations
  };
}

/**
 * 6. Pattern Detection
 */
export function detectPatterns(dataset) {
  const patterns = {};
  
  dataset.forEach(report => {
    if (report.mappedRules && report.mappedRules.length > 0 && report.extractedPrecursors && report.extractedPrecursors.barrierFailures) {
      const rule = report.mappedRules[0].rule;
      report.extractedPrecursors.barrierFailures.forEach(bf => {
        if (bf !== 'N/A') {
          const key = `${rule} + ${bf}`;
          if (!patterns[key]) {
            patterns[key] = { pattern: key, occurrences: 0, sifCount: 0, sites: new Set(), rule, mainBarrier: bf };
          }
          patterns[key].occurrences++;
          patterns[key].sites.add(report.facility);
          if (report.isSifPotential) patterns[key].sifCount++;
        }
      });
    }
  });

  return Object.values(patterns)
    .map(p => ({ ...p, sites: Array.from(p.sites), priority: p.sifCount * p.occurrences }))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * 7. SIF Density Calculation
 */
export function calculateSIFDensity(dataset, groupByDimension) {
  const groups = {};
  
  dataset.forEach(report => {
    const key = report[groupByDimension] || 'Unknown';
    if (!groups[key]) {
      groups[key] = { name: key, total: 0, sifPotential: 0 };
    }
    groups[key].total++;
    if (report.isSifPotential) groups[key].sifPotential++;
  });

  return Object.values(groups).map(g => ({
    ...g,
    density: g.total > 0 ? ((g.sifPotential / g.total) * 100).toFixed(1) : 0
  })).sort((a, b) => b.density - a.density);
}

/**
 * 8. Site & Activity Ranking
 */
export function rankSitesAndActivities(dataset) {
  const sites = calculateSIFDensity(dataset, 'facility');
  const activities = calculateSIFDensity(dataset, 'reportType'); // Assuming reportType acts as activity for now, can be updated
  return { sites, activities };
}
