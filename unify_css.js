const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Replace the first :root block
const oldRootPattern = /:root\s*\{.*?\/\*\s*Typography\s*\*\/.*?--text-xl:\s*20px;\s*\}/s;
const newRoot = `:root {
    /* Unified Neo Dashboard Palette */
    --primary-color: #2563eb;
    --brand-900: #0f172a;
    --brand-700: #1d4ed8;
    --brand-500: #3b82f6;
    --surface-soft: #f8fbff;
    --surface-card: #ffffff;
    --border-soft: #dbe7ff;
    --text-main: #0f172a;
    --text-sub: #475569;

    --shadow-soft: 0 10px 30px rgba(37, 99, 235, 0.08);
    --shadow-hard: 0 14px 34px rgba(15, 23, 42, 0.12);
    --radius-xl: 18px;
    --radius-lg: 14px;
    --radius-md: 10px;
    --radius-sm: 6px;
    
    /* Legacy variable mappings (to ensure classic components adapt to the new theme seamlessly) */
    --k-bg-body: #eff6ff; 
    --k-bg-surface: var(--surface-card);
    --k-primary: var(--brand-700);
    --k-primary-dark: var(--brand-900);
    --k-text-main: var(--text-main);
    --k-text-light: var(--text-sub);
    --k-border: var(--border-soft);
    --k-success: #10b981;
    --k-warning: #f59e0b;
    --k-danger: #ef4444;

    /* Layout Logic */
    --nav-height: 62px;
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;

    /* Typography */
    --font-base: 'Outfit', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
    --text-xs: 11px;
    --text-sm: 12px;
    --text-base: 13px;
    --text-lg: 16px;
    --text-xl: 20px;
}`;

css = css.replace(oldRootPattern, newRoot);

// 2. Remove the second :root block
const neoRootPattern = /\/\*\s*=====\s*Renovation:\s*Neo Dashboard Format\s*\(v6\)\s*=====\s*\*\/\s*:root\s*\{.*?\-\-radius\-md:\s*10px;\s*\}/s;
css = css.replace(neoRootPattern, '/* ===== Renovation: Neo Dashboard Format (v6) ===== */');

// 3. Fix input and select to use new borders
css = css.replace(/border-radius:\s*0;\r?\n\s*\/\*\s*Square corners\s*\*\//g, "border-radius: var(--radius-md);");
css = css.replace(/border-radius:\s*0;/g, "border-radius: var(--radius-sm);");

// 4. Fix .input-compact and .btn definitions
css = css.replace(/border:\s*1px solid #aaa;/g, "border: 1px solid var(--border-soft);");

css = css.replace(/border-radius:\s*4px;/g, "border-radius: var(--radius-md);");
css = css.replace(/border-radius:\s*3px;/g, "border-radius: var(--radius-sm);");

css = css.replace(/border-radius:\s*2px;\r?\n\s*\/\*\s*Slight roundness\s*\*\//g, "border-radius: var(--radius-md);");
css = css.replace(/border-radius:\s*2px;/g, "border-radius: var(--radius-md);");

fs.writeFileSync(cssPath, css, 'utf8');
console.log('CSS Unification Applied');
