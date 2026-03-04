import os
import re

css_path = r"c:\Users\Admin\Desktop\Projects\power_plant_feasibility_v2\style.css"

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Replace the first :root block
old_root_pattern = r":root\s*\{.*?\/\*\s*Typography\s*\*\/.*?--text-xl:\s*20px;\s*\}"
new_root = """:root {
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
}"""

css = re.sub(old_root_pattern, new_root, css, flags=re.DOTALL)

# 2. Remove the second :root block
neo_root_pattern = r"\/\*\s*=====\s*Renovation:\s*Neo Dashboard Format\s*\(v6\)\s*=====\s*\*\/\s*:root\s*\{.*?\-\-radius\-md:\s*10px;\s*\}"
css = re.sub(neo_root_pattern, r"/* ===== Renovation: Neo Dashboard Format (v6) ===== */", css, flags=re.DOTALL)

# 3. Fix input and select to use new borders
css = css.replace("border-radius: 0;\r\n    /* Square corners */", "border-radius: var(--radius-md);")
css = css.replace("border-radius: 0;\n    /* Square corners */", "border-radius: var(--radius-md);")

# 4. Fix .input-compact
css = css.replace("border-radius: 0;", "border-radius: var(--radius-sm);")
css = css.replace("border: 1px solid #aaa;", "border: 1px solid var(--border-soft);")

# 5. Fix .view-toggle
css = css.replace("border-radius: 4px;", "border-radius: var(--radius-md);")
css = css.replace("border-radius: 3px;", "border-radius: var(--radius-sm);")

# 6. Fix .btn and .btn-sm
css = css.replace("border-radius: 2px;\r\n    /* Slight roundness */", "border-radius: var(--radius-md);")
css = css.replace("border-radius: 2px;\n    /* Slight roundness */", "border-radius: var(--radius-md);")

# 7. Write back
with open(css_path, "w", encoding="utf-8") as f:
    f.write(css)

print("CSS Unification Applied")
