#!/usr/bin/env node

/**
 * Checkpoint-Based Task Ledger CLI Tool (v3.6)
 * Automates PROGRESS.md updates, calculates percentages, and validates steps.
 * Features a high-fidelity visual dashboard, terminal UI, target file verifier, and start command.
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_PATH = path.join(process.cwd(), 'plan/PROGRESS.md');
const STEPS_DIR = path.join(process.cwd(), 'plan/steps');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
  bgCyan: '\x1b[46m\x1b[30m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✘ ${msg}${colors.reset}`),
  header: (msg) => {
    console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐`);
    console.log(`│ ${msg.toUpperCase().padEnd(52)} │`);
    console.log(`└${'─'.repeat(54)}┘${colors.reset}\n`);
  }
};

// Help menu
function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐
│   Ledger CLI — Dynamic Task Tracking System V3.6      │
└${'─'.repeat(54)}┘${colors.reset}

${colors.bright}Usage:${colors.reset}
  node .agents/scripts/ledger.cjs <command> [args]
  ./l <command> [args]

${colors.bright}Commands:${colors.reset}
  ${colors.green}status (s)${colors.reset}               Show compact, visual progress dashboard (Default)
  ${colors.green}start <step>${colors.reset}             Initialize a step: create files, directory, & boilerplate
  ${colors.green}complete (c) <step> <note>${colors.reset} Mark a step as done, auto-verify file, update log
  ${colors.green}validate (v)${colors.reset}             Check 1:1 sync between PROGRESS.md and plan files
  ${colors.green}help (h)${colors.reset}                 Show this help menu

${colors.bright}Examples:${colors.reset}
  ./l
  ./l start 2.2
  ./l c 2.2 "Created Dropdown UI component"
  ./l v
`);
}

// Check if progress file exists
function checkFiles() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    log.error(`PROGRESS.md file not found at ${PROGRESS_PATH}`);
    process.exit(1);
  }
}

// Parse PROGRESS.md structure
function parseProgress() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const phases = [];
  let currentPhase = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect Phase header
    const phaseMatch = line.match(/^## 🔷 Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1]),
        name: phaseMatch[2].trim(),
        statusText: phaseMatch[3].trim(),
        steps: [],
        headerIndex: i,
        headerLine: line
      };
      continue;
    }
    
    // Detect Step checkbox inside current phase (supports [ ], [x], [/], [~], [!])
    const stepMatch = line.match(/^\s*-\s*\[([ x!/~])\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.*)$/);
    if (stepMatch && currentPhase) {
      currentPhase.steps.push({
        status: stepMatch[1] === 'x' ? 'done' : (stepMatch[1] === '/' || stepMatch[1] === '~') ? 'running' : stepMatch[1] === '!' ? 'blocked' : 'pending',
        number: stepMatch[2].trim(),
        title: stepMatch[3].trim(),
        lineIndex: i,
        lineContent: line
      });
    }
  }
  if (currentPhase) phases.push(currentPhase);
  
  return { content, lines, phases };
}

// Helper to draw a progress bar
function getProgressBar(pct, size = 15) {
  const filled = Math.round((pct / 100) * size);
  const empty = size - filled;
  return `[${colors.green}${"█".repeat(filled)}${colors.reset}${"░".repeat(empty)}]`;
}

// Helper: search for a file recursively in a directory
function findFileRecursively(dir, fileName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'dist' || file === '.git' || file === '.npm-cache' || file === 'src-tauri') continue;
      const found = findFileRecursively(fullPath, fileName);
      if (found) return found;
    } else if (file === fileName) {
      return fullPath;
    }
  }
  return null;
}

// Helper: Verify if target file exists and is not empty
function verifyTargetFile(stepTitle) {
  // Regex to match anything in backticks or parenthesis that looks like a file path or filename ending in ts, tsx, css, js, json, jsx
  const fileMatches = stepTitle.match(/[`(]([^`)]+\.(?:tsx|ts|css|js|json|jsx))[`)]/);
  if (!fileMatches) {
    return { verified: true }; // No target file to verify, bypass
  }

  const targetNameOrPath = fileMatches[1].trim();
  let absolutePath = path.join(process.cwd(), targetNameOrPath);

  // If path doesn't exist directly, search recursively in src/ folder
  if (!fs.existsSync(absolutePath)) {
    const foundPath = findFileRecursively(path.join(process.cwd(), 'src'), path.basename(targetNameOrPath));
    if (foundPath) {
      absolutePath = foundPath;
    } else {
      return { verified: false, error: `❌ cannot complete step: target file "${targetNameOrPath}" does not exist.` };
    }
  }

  // Check if file size is 0 bytes (truly empty)
  const stats = fs.statSync(absolutePath);
  if (stats.size === 0) {
    return { verified: false, error: `❌ cannot complete step: target file "${targetNameOrPath}" is empty.` };
  }

  // Check if file size is < 10 bytes (essentially empty)
  if (stats.size < 10) {
    return { verified: false, error: `❌ cannot complete step: target file "${targetNameOrPath}" has no meaningful content (< 10 bytes).` };
  }

  return { verified: true, path: absolutePath };
}

// 1. Status Command
function statusCommand() {
  checkFiles();
  const { phases } = parseProgress();
  
  log.header("Ledger Progress Board");
  
  let totalSteps = 0;
  let doneSteps = 0;
  let activePhase = null;
  
  for (const p of phases) {
    const pTotal = p.steps.length;
    const pDone = p.steps.filter(s => s.status === 'done').length;
    totalSteps += pTotal;
    doneSteps += pDone;
    
    if (pDone < pTotal && !activePhase) {
      activePhase = p;
    }
  }
  
  if (!activePhase && phases.length > 0) {
    activePhase = phases[phases.length - 1];
  }
  
  phases.forEach(p => {
    const pTotal = p.steps.length;
    const pDone = p.steps.filter(s => s.status === 'done').length;
    const pct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
    
    const isPhaseActive = activePhase && p.number === activePhase.number;
    
    let statusMarker = "";
    let colorPrefix = "";
    let bullet = "⏳";
    
    if (pct === 100) {
      statusMarker = "COMPLETE";
      colorPrefix = colors.green;
      bullet = "🟢";
    } else if (pct > 0) {
      statusMarker = `${pct}% ACTIVE`;
      colorPrefix = colors.yellow;
      bullet = "🟡";
    } else {
      statusMarker = "PENDING";
      colorPrefix = colors.gray;
      bullet = "⚪";
    }
    
    const barStr = getProgressBar(pct, 12);
    const phaseLabel = `Phase ${p.number}: ${p.name}`;
    const leftText = ` ${bullet} ${colorPrefix}${phaseLabel.padEnd(45, ' ')}${colors.reset}`;
    const rightText = `${barStr} ${colorPrefix}${statusMarker.padStart(12, ' ')}${colors.reset}`;
    
    if (isPhaseActive) {
      console.log(`${colors.bright}┌${'─'.repeat(74)}┐${colors.reset}`);
      console.log(`│${leftText.padEnd(85, ' ')} ${rightText.padStart(25, ' ')} │`);
      console.log(`${colors.bright}├${'─'.repeat(74)}┤${colors.reset}`);
      
      p.steps.forEach(s => {
        let stepIndicator = `[ ]`;
        let stepColor = colors.reset;
        let stepTitleText = s.title;
        
        if (s.status === 'done') {
          stepIndicator = `[✓]`;
          stepColor = colors.green;
          stepTitleText = `${colors.dim}${colors.gray}${s.title}${colors.reset}`;
        } else if (s.status === 'running') {
          stepIndicator = `[/]`;
          stepColor = colors.yellow;
          stepTitleText = `${colors.bright}${colors.yellow}${s.title}${colors.reset}`;
        } else if (s.status === 'blocked') {
          stepIndicator = `[!]`;
          stepColor = colors.red;
        } else {
          stepColor = colors.bright;
        }
        
        console.log(`│    ${stepColor}${stepIndicator} Step ${s.number.padEnd(4, ' ')} — ${stepTitleText.padEnd(52, ' ')}${colors.reset} │`);
      });
      console.log(`${colors.bright}└${'─'.repeat(74)}┘${colors.reset}`);
    } else {
      console.log(` ${bullet} ${colors.dim}${phaseLabel.padEnd(45, ' ')}${colors.reset} ${barStr} ${colorPrefix}${statusMarker.padStart(12, ' ')}${colors.reset}`);
    }
  });
  
  const overallPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  const overallBar = getProgressBar(overallPct, 20);
  
  console.log(`\n┌${'─'.repeat(74)}┐`);
  console.log(`│ ${colors.bright}OVERALL PROGRESS:${colors.reset.padEnd(35)} ${overallBar} ${colors.bright}${overallPct}% (${doneSteps}/${totalSteps})${colors.reset.padStart(15)} │`);
  
  let nextStepPointer = "None (Project Completed) 🎉";
  for (const p of phases) {
    const s = p.steps.find(step => step.status !== 'done');
    if (s) {
      nextStepPointer = `Step ${s.number} — ${s.title}`;
      break;
    }
  }
  console.log(`│ ${colors.dim}👉 NEXT:${colors.reset.padEnd(16)} ${nextStepPointer.padEnd(55)} │`);
  console.log(`└${'─'.repeat(74)}┘\n`);
}

// 2. Start Command
function startCommand(stepNum) {
  checkFiles();
  if (!stepNum) {
    log.error("Please provide a step number (e.g., 2.2)");
    process.exit(1);
  }

  const { lines, phases } = parseProgress();
  
  // Find step
  let targetStep = null;
  let targetPhase = null;
  for (const p of phases) {
    const s = p.steps.find(step => step.number === stepNum);
    if (s) {
      targetStep = s;
      targetPhase = p;
      break;
    }
  }

  if (!targetStep) {
    log.error(`Step ${stepNum} not found in PROGRESS.md!`);
    process.exit(1);
  }

  if (targetStep.status === 'done') {
    log.warn(`Step ${stepNum} is already marked as completed.`);
    process.exit(0);
  }

  log.info(`Initializing Step ${stepNum}...`);

  // Parse plan file for this step
  const planPath = path.join(STEPS_DIR, 'plan_01.md');
  if (!fs.existsSync(planPath)) {
    log.error(`Plan file not found at ${planPath}`);
    process.exit(1);
  }

  const planContent = fs.readFileSync(planPath, 'utf8');
  const planLines = planContent.split(/\r?\n/);
  
  let fileLine = "";
  let actionLine = "";
  let insideStep = false;
  
  for (let i = 0; i < planLines.length; i++) {
    const line = planLines[i];
    if (line.startsWith(`### Step ${stepNum} `) || line.startsWith(`### Step ${stepNum} —`)) {
      insideStep = true;
      continue;
    }
    if (insideStep && line.startsWith('### ')) {
      break;
    }
    if (insideStep) {
      if (line.includes('**File**:')) fileLine = line;
      if (line.includes('**Action**:')) actionLine = line;
    }
  }

  if (fileLine) {
    const fileMatches = fileLine.match(/\`([^\`]+)\`/);
    
    if (fileMatches) {
      const filePath = fileMatches[1].trim();
      const targetAbsPath = path.join(process.cwd(), filePath);
      
      // Determine action: if no Action line found, default to 'create'
      let action = 'create';
      if (actionLine) {
        const actionMatches = actionLine.match(/\*\*Action\*\*:\s*\[?(.*?)\]?$/i);
        if (actionMatches) {
          action = actionMatches[1].trim().toLowerCase();
        }
      }
      
      // Skip file creation only if action explicitly says modify/update/overwrite on existing file
      const isModifyAction = action.includes('modify') || action.includes('update') || action.includes('edit');
      
      if (isModifyAction && fs.existsSync(targetAbsPath)) {
        log.info(`File ${filePath} exists and action is "${action}". Skipping boilerplate.`);
      } else if (fs.existsSync(targetAbsPath)) {
        log.warn(`File ${filePath} already exists. Skipping boilerplate creation.`);
      } else {
        // Create directory
        fs.mkdirSync(path.dirname(targetAbsPath), { recursive: true });
        
        // Generate boilerplate based on extension
        const ext = path.extname(filePath);
        const baseName = path.basename(filePath, ext);
        let boilerplate = "";
        
        if (ext === '.tsx') {
          boilerplate = `import React from 'react';\n\ninterface ${baseName}Props {\n  // TODO: Add props defined in steps plan\n}\n\nexport const ${baseName}: React.FC<${baseName}Props> = () => {\n  return (\n    <div className="glass-capsule p-4 rounded-lg">\n      <h3 className="text-xs font-bold text-gray-300">${baseName} Boilerplate</h3>\n      {/* TODO: Implement interface/layout as outlined in details */}\n    </div>\n  );\n};\n`;
        } else if (ext === '.ts') {
          boilerplate = `// Boilerplate for ${baseName}\n// TODO: Implement types/actions according to steps plan\n`;
        } else if (ext === '.css') {
          boilerplate = `/* Stylesheet for ${baseName} */\n/* TODO: Implement Tailwind styles/keyframes */\n`;
        } else if (ext === '.js') {
          boilerplate = `// Boilerplate for ${baseName}\n// TODO: Implement according to steps plan\n`;
        } else {
          boilerplate = `// Started step ${stepNum}\n`;
        }
        
        fs.writeFileSync(targetAbsPath, boilerplate, 'utf8');
        log.success(`Created target file: ${filePath} with boilerplate!`);
      }
    }
  } else {
    log.warn(`No **File** line found in plan for Step ${stepNum}. Skipping file creation.`);
  }

  // 2. Mark step status as 'running' in PROGRESS.md: - [~]
  const originalLine = lines[targetStep.lineIndex];
  lines[targetStep.lineIndex] = originalLine.replace(/-\s*\[([ x!/~])\]/, '- [~]');
  
  // 3. If Phase in summary table is PENDING, mark as IN PROGRESS
  const phaseTableRowRegex = new RegExp(`\\|\\s*Phase\\s+${targetPhase.number}\\s*\\|`);
  for (let i = 0; i < lines.length; i++) {
    if (phaseTableRowRegex.test(lines[i])) {
      if (lines[i].includes('🔴 PENDING')) {
        lines[i] = lines[i].replace('🔴 PENDING', '🟡 IN PROGRESS');
      }
      break;
    }
  }

  // If Phase header status is PENDING, mark as IN PROGRESS
  const phaseHeaderOriginal = lines[targetPhase.headerIndex];
  if (phaseHeaderOriginal.includes('🔴 0% PENDING')) {
    lines[targetPhase.headerIndex] = phaseHeaderOriginal.replace('🔴 0% PENDING', '🟡 0% IN PROGRESS');
  }

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  log.success(`Step ${stepNum} initialized. PROGRESS.md updated to In Progress [~].`);
}

// 3. Complete Command
function completeCommand(stepNum, comment) {
  checkFiles();
  if (!stepNum) {
    log.error("Please provide a step number (e.g., 1.1)");
    process.exit(1);
  }
  if (!comment) {
    log.error("Please provide a completion comment/note");
    process.exit(1);
  }
  
  const { lines, phases } = parseProgress();
  
  // Find step
  let targetStep = null;
  let targetPhase = null;
  
  for (const p of phases) {
    const s = p.steps.find(step => step.number === stepNum);
    if (s) {
      targetStep = s;
      targetPhase = p;
      break;
    }
  }
  
  if (!targetStep) {
    log.error(`Step ${stepNum} not found in PROGRESS.md!`);
    process.exit(1);
  }
  
  if (targetStep.status === 'done') {
    log.warn(`Step ${stepNum} is already marked as completed.`);
    process.exit(0);
  }
  
  // V3.6: Auto-Verification Gate
  log.info(`Verifying completion of Step ${stepNum}...`);
  const verification = verifyTargetFile(targetStep.title);
  if (!verification.verified) {
    console.log(`\n${colors.bright}${colors.red}┌${'─'.repeat(74)}┐`);
    console.log(`│ ❌ CANNOT COMPLETE STEP: Verification Failed                              │`);
    console.log(`├${'─'.repeat(74)}┤`);
    console.log(`│ ${colors.reset}${verification.error.padEnd(73)}${colors.red}│`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
    log.error(`Step ${stepNum} cannot be marked complete. Fix the issue above and retry.`);
    process.exit(1);
  }

  if (verification.path) {
    log.success(`File verified: ${path.relative(process.cwd(), verification.path)}`);
  }

  log.info(`Marking Step ${stepNum} as complete...`);
  
  // 1. Tick the checkbox in PROGRESS.md
  const originalLine = lines[targetStep.lineIndex];
  lines[targetStep.lineIndex] = originalLine.replace(/-\s*\[([ x!/~])\]/, '- [x]');
  targetStep.status = 'done'; // Update memory model
  
  // 2. Recalculate Phase percentage
  const pTotal = targetPhase.steps.length;
  const pDone = targetPhase.steps.filter(s => s.status === 'done').length;
  const pPct = Math.round((pDone / pTotal) * 100);
  
  let phaseStatusText = "";
  let phaseTableStatus = "";
  if (pPct === 100) {
    phaseStatusText = "✅ 100% COMPLETE";
    phaseTableStatus = "✅ COMPLETE";
  } else {
    phaseStatusText = `🟡 ${pPct}% IN PROGRESS`;
    phaseTableStatus = `🟡 IN PROGRESS`;
  }
  
  // Update Phase header line in markdown
  const phaseHeaderOriginal = lines[targetPhase.headerIndex];
  lines[targetPhase.headerIndex] = phaseHeaderOriginal.split('—')[0] + '— ' + phaseStatusText;
  
  // 3. Update Overall Progress bar & numbers
  let totalSteps = 0;
  let doneSteps = 0;
  phases.forEach(p => {
    totalSteps += p.steps.length;
    doneSteps += p.steps.filter(s => s.status === 'done').length;
  });
  const overallPct = Math.round((doneSteps / totalSteps) * 100);
  
  const totalBars = 20;
  const filledBars = Math.round((overallPct / 100) * totalBars);
  const bar = "█".repeat(filledBars) + "░".repeat(totalBars - filledBars);
  
  // Find and update the Overall Progress lines
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Overall Progress:')) {
      lines[i] = `## 📊 Overall Progress: ${overallPct}% (${doneSteps}/${totalSteps} steps complete)`;
    }
    if (lines[i].startsWith('[') && (lines[i].endsWith('steps complete)') || lines[i].includes('% ('))) {
      lines[i] = `[${bar}] ${overallPct}% (${doneSteps}/${totalSteps} steps complete)`;
    }
  }
  
  // 4. Update Overview Table row for this phase
  const phaseTableRowRegex = new RegExp(`\\|\\s*Phase\\s+${targetPhase.number}\\s*\\|`);
  for (let i = 0; i < lines.length; i++) {
    if (phaseTableRowRegex.test(lines[i])) {
      const parts = lines[i].split('|');
      parts[3] = ` ${pDone}/${pTotal} `;
      parts[4] = ` ${phaseTableStatus} `;
      lines[i] = parts.join('|');
      break;
    }
  }
  
  // 5. Update the "👉 NEXT:" pointer to the first pending step
  let nextStepStr = "None (Project Complete) ✅";
  let foundNext = false;
  for (const p of phases) {
    const nextPending = p.steps.find(s => s.status !== 'done');
    if (nextPending) {
      nextStepStr = `Step ${nextPending.number} — ${nextPending.title}`;
      foundNext = true;
      break;
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) {
      lines[i] = `## 👉 NEXT: ${nextStepStr}`;
    }
    if (foundNext && lines[i].startsWith('> 📋 Details →')) {
      const match = nextStepStr.match(/Step (\d+)\.(\d+)/);
      if (match) {
        lines[i] = `> 📋 Details → \`plan/steps/plan_01.md\` → Phase ${match[1]} → Step ${match[1]}.${match[2]}`;
      }
    }
  }
  
  // 6. Write Log Entry
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  
  const formattedDate = `${year}-${month}-${day} ${hours}:${mins}`;
  const modelName = process.env.GEMINI_MODEL || 'CLI';
  const newLogEntry = `[${formattedDate}] Step ${stepNum} completed — ${comment} | Agent: ${modelName}`;
  
  let logInsertIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('LOG:')) {
      logInsertIndex = i + 1;
      break;
    }
  }
  
  if (logInsertIndex !== -1) {
    if (lines[logInsertIndex].includes('(no entries yet)')) {
      lines[logInsertIndex] = newLogEntry;
    } else {
      let appendIndex = logInsertIndex;
      while (appendIndex < lines.length && !lines[appendIndex].includes('-->') && lines[appendIndex].trim() !== '═══════════════════════════════════════════════════════════════════════') {
        appendIndex++;
      }
      lines.splice(appendIndex, 0, newLogEntry);
    }
  }
  
  // 7. Write back PROGRESS.md
  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  
  // Premium Step completion layout
  console.log(`\n${colors.bright}${colors.green}┌${'─'.repeat(74)}┐`);
  console.log(`│ 🎉  STEP ${stepNum} COMPLETED SUCCESSFULLY!`.padEnd(75) + "│");
  console.log(`│ ${colors.gray}${comment.substring(0, 70).padEnd(72)}${colors.reset} │`);
  console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  
  // If phase is complete, show celebration
  if (pPct === 100) {
    console.log(`${colors.bright}${colors.bgCyan}┌${'─'.repeat(74)}┐`);
    console.log(`│ 🏆  PHASE ${targetPhase.number} COMPLETED: ${targetPhase.name.toUpperCase().padEnd(46)} │`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  }
  
  // Show updated overall progress summary
  const overallBar = getProgressBar(overallPct, 20);
  console.log(`${colors.bright}Overall progress updated to ${colors.green}${overallPct}%${colors.reset} ${overallBar} (${doneSteps}/${totalSteps} steps).`);
}

// 4. Validate Command
function validateCommand() {
  checkFiles();
  
  if (!fs.existsSync(STEPS_DIR)) {
    log.error(`Steps directory not found at ${STEPS_DIR}`);
    process.exit(1);
  }
  
  const planFiles = fs.readdirSync(STEPS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.'));
  if (planFiles.length === 0) {
    log.error(`No plan markdown files found inside ${STEPS_DIR}`);
    process.exit(1);
  }
  
  log.header("Validating Ledger Alignment");
  
  const { phases } = parseProgress();
  
  // Aggregate all steps listed in PROGRESS.md
  const progressSteps = {};
  phases.forEach(p => {
    p.steps.forEach(s => {
      progressSteps[s.number] = s.title;
    });
  });
  
  let totalMismatches = 0;
  
  planFiles.forEach(pf => {
    const filePath = path.join(STEPS_DIR, pf);
    const planContent = fs.readFileSync(filePath, 'utf8');
    const planLines = planContent.split(/\r?\n/);
    
    log.info(`Scanning steps plan: plan/steps/${pf}`);
    
    planLines.forEach((line) => {
      const stepMatch = line.match(/^###\s*Step\s*(\d+\.\d+)\s*—\s*(.*)$/);
      if (stepMatch) {
        const stepNum = stepMatch[1].trim();
        const stepTitle = stepMatch[2].trim();
        
        if (!progressSteps[stepNum]) {
          log.error(`Mismatch: Step ${stepNum} ("${stepTitle}") in plan file is MISSING in PROGRESS.md!`);
          totalMismatches++;
        } else {
          const cleanTitle = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanTitle(progressSteps[stepNum]).substring(0, 15) !== cleanTitle(stepTitle).substring(0, 15)) {
            log.warn(`Step ${stepNum} title minor mismatch:`);
            console.log(`  └─ PROGRESS.md : ${colors.yellow}${progressSteps[stepNum]}${colors.reset}`);
            console.log(`  └─ Plan step   : ${colors.cyan}${stepTitle}${colors.reset}`);
          }
          delete progressSteps[stepNum];
        }
      }
    });
  });
  
  const leftOvers = Object.keys(progressSteps);
  if (leftOvers.length > 0) {
    leftOvers.forEach(num => {
      log.error(`Mismatch: Step ${num} ("${progressSteps[num]}") in PROGRESS.md is MISSING in plan files!`);
      totalMismatches++;
    });
  }
  
  console.log("");
  if (totalMismatches === 0) {
    console.log(`${colors.bright}${colors.green}┌${'─'.repeat(74)}┐`);
    console.log("│                  ✅  PLAN VALIDATION PASSED  ✅                         │");
    console.log("│     Ledger system is 100% in sync with plan step files.                │");
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  } else {
    console.log(`${colors.bright}${colors.red}┌${'─'.repeat(74)}┐`);
    console.log("│                  ❌  PLAN VALIDATION FAILED  ❌                         │");
    console.log(`│     Found ${totalMismatches} mismatch(es) between PROGRESS.md and step files.           │`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
    process.exit(1);
  }
}

// Main execution block
const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'status';

switch (command) {
  case 'help':
  case '--help':
  case '-h':
  case 'h':
    showHelp();
    break;
  case 'status':
  case 's':
    statusCommand();
    break;
  case 'start':
    startCommand(args[1]);
    break;
  case 'complete':
  case 'c':
    completeCommand(args[1], args[2]);
    break;
  case 'validate':
  case 'v':
    validateCommand();
    break;
  default:
    log.error(`Unknown command: "${command}"`);
    showHelp();
    process.exit(1);
}
