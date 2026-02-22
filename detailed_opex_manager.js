class DetailedOpexManager {
    constructor() {
        this.container = document.getElementById('content-area');
        // Initial State or Load from InputManager
        this.state = window.inputApps && window.inputApps.currentInputs.detailedOpex ?
            window.inputApps.currentInputs.detailedOpex : [];
    }

    loadPresetsWithConfirm() {
        if (confirm('Load template preset? This will overwrite your current items.')) {
            this.loadPresets();
        }
    }

    loadPresets() {
        if (window.AppConfig && window.AppConfig.defaults && window.AppConfig.defaults.detailedOpexPresets) {
            const presets = JSON.parse(JSON.stringify(window.AppConfig.defaults.detailedOpexPresets));
            const ts = Date.now();

            // Replace placeholder {ts} with timestamp to ensure unique IDs
            this.state = presets.map(item => {
                if (item.id.includes('{ts}')) {
                    item.id = item.id.replace(/{ts}/g, ts);
                }
                if (item.linkedSourceId && typeof item.linkedSourceId === 'string' && item.linkedSourceId.includes('{ts}')) {
                    item.linkedSourceId = item.linkedSourceId.replace(/{ts}/g, ts);
                }
                return item;
            });

            this.updateState();
            this.render();
        }
    }

    render() {
        if (!this.container) return; // Guard

        // 1. Calculations & Prep
        const totalAnnualCost = this.calculateTotalCost();

        // Group by Category
        const groups = {};

        // Dynamically create groups based on existing data
        this.state.forEach((item, index) => {
            const cat = item.category || 'Others';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ item, index });
        });

        // Ensure at least "Others" exists if empty
        if (Object.keys(groups).length === 0) {
            groups['Others'] = [];
        }

        // 2. Generate Grid HTML
        let gridHtml = '';
        Object.keys(groups).forEach(cat => {
            // Mini Header
            const headerHtml = `
                <div style="display:flex; gap:5px; padding:5px 0 5px 0; border-bottom:1px solid #e0e0e0; font-size:10px; font-weight:700; color:#666; letter-spacing:0.5px; text-transform:uppercase;">
                    <span style="flex:2.5; padding-left:4px;">Item Name</span>
                    <span style="flex:3.5;">Quantity Logic</span>
                    <span style="flex:1.0; text-align:right;">Price</span>
                    <span style="flex:1.2; text-align:right;">Total/Yr</span>
                    <span style="width:24px;"></span>
                </div>`;

            // Items and Category Sub-total
            let catTotal = 0;
            const itemsHtml = groups[cat].map(({ item, index }) => {
                const resolvedQty = this.getQuantity(item);
                const annualCost = this.calculateItemCost(item);
                catTotal += annualCost;

                // Logic Column: Manual Inputs vs Linked UI
                let logicCol = '';
                if (item.mode === 'linked') {
                    // Linked Mode UI
                    const potentialSources = this.state.filter(i => i.id !== item.id); // No self-link
                    const options = potentialSources.map(s => `<option value="${s.id}" ${s.id === item.linkedSourceId ? 'selected' : ''}>${s.name}</option>`).join('');

                    logicCol = `
                        <div style="display:flex; align-items:center; gap:4px; height:100%;">
                            <select class="input-compact" style="flex:1; padding:0 2px; font-size:11px;" onchange="detailedOpexApp.update(${index}, 'linkedSourceId', this.value)">
                                <option value="">Select Source...</option>
                                ${options}
                            </select>
                            <span style="font-size:10px; color:#666;">x</span>
                            <input type="number" class="input-compact" style="width:45px; text-align:center; padding:0;" placeholder="Qty" 
                                   value="${item.multiplier || 1}" step="any" onchange="detailedOpexApp.update(${index}, 'multiplier', this.value)">
                            <button class="btn-icon" title="Switch to Manual" onclick="detailedOpexApp.update(${index}, 'mode', 'manual')"><i class="fa-solid fa-link"></i></button>
                        </div>
                    `;
                } else {
                    // Manual Mode UI
                    logicCol = `
                        <div style="display:flex; align-items:center; gap:4px; height:100%;">
                            <input type="number" class="input-compact" style="width:70px; text-align:center;" placeholder="Qty" 
                                   value="${item.quantity}" onchange="detailedOpexApp.update(${index}, 'quantity', this.value)">
                            <input type="text" class="input-compact" style="width:60px; padding:0 2px;" placeholder="Unit" 
                                   value="${item.unit || ''}" onchange="detailedOpexApp.update(${index}, 'unit', this.value)">
                            <select class="input-compact" style="flex:1; padding:0 2px; font-size:11px;" onchange="detailedOpexApp.update(${index}, 'freqType', this.value)">
                                <option value="daily" ${item.freqType === 'daily' ? 'selected' : ''}>Daily</option>
                                <option value="monthly" ${item.freqType === 'monthly' ? 'selected' : ''}>Monthly</option>
                                <option value="yearly" ${item.freqType === 'yearly' ? 'selected' : ''}>Yearly</option>
                            </select>
                            <button class="btn-icon" title="Link to Item" style="opacity:0.3" onclick="detailedOpexApp.update(${index}, 'mode', 'linked')"><i class="fa-solid fa-link-slash"></i></button>
                        </div>
                    `;
                }

                return `
                <div class="opex-item compact-row" style="background:transparent; border-bottom:1px solid #f5f5f5; padding:6px 0; display:flex; align-items:center; gap:5px; margin:0;">
                    <!-- Name -->
                    <input type="text" class="input-compact" style="flex:2.5; min-width:0; border:1px solid transparent; background:transparent; font-weight:600; font-size:12px; padding-left:4px;" 
                           value="${item.name}" placeholder="Item Name"
                           onfocus="this.style.background='white'; this.style.border='1px solid #ddd';"
                           onblur="this.style.background='transparent'; this.style.border='1px solid transparent';"
                           onchange="detailedOpexApp.update(${index}, 'name', this.value)">

                    <!-- Logic (Qty/Link) -->
                    <div style="flex:3.5; min-width:0;">
                         ${logicCol}
                    </div>

                    <!-- Price -->
                    <input type="number" class="input-compact text-end" style="flex:1.0; min-width:0;" placeholder="Price" 
                           value="${item.price}" onchange="detailedOpexApp.update(${index}, 'price', this.value)">

                    <!-- Total (Read only) -->
                    <span style="flex:1.2; font-size:11px; font-weight:bold; color:#107c41; text-align:right;">
                        ${annualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>

                    <!-- Delete -->
                    <button class="btn btn-danger btn-icon btn-sm" style="width:24px; height:24px; min-height:0;" onclick="detailedOpexApp.remove(${index})">
                        <i class="fa-solid fa-times" style="font-size:12px;"></i>
                    </button>
                </div>
                `;
            }).join('');

            const catMillion = catTotal / 1000000;

            // Category Block
            gridHtml += `
            <div class="category-block" style="break-inside: avoid; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); overflow:hidden;">
                <div class="sub-header" style="background: #f8f9fa; padding: 6px 12px; border-bottom: 1px solid #e0e0e0; display:flex; justify-content:space-between; align-items:center;">
                    <input type="text" style="font-weight: 700; font-size:14px; color: #005a9e; background:transparent; border:1px solid transparent; width:50%;" 
                           value="${cat}" 
                           onfocus="this.style.background='white'; this.style.border='1px solid #0078d4'; this.style.borderRadius='4px'; this.style.padding='2px';"
                           onblur="this.style.background='transparent'; this.style.border='1px solid transparent'; this.style.padding='0';"
                           onchange="detailedOpexApp.renameCategory('${cat}', this.value)">
                    <div style="display:flex; align-items:center; gap: 10px;">
                        <span style="font-size:12px; font-weight:bold; color:#107c41;">${catMillion.toFixed(2)} M THB</span>
                        <button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size:10px;" onclick="detailedOpexApp.add('${cat}')">
                            <i class="fa-solid fa-plus"></i> Item
                        </button>
                    </div>
                </div>
                <div style="padding: 0 10px 5px 10px;">
                    ${headerHtml}
                    ${itemsHtml}
                </div>
            </div>`;
        });

        // 3. Final HTML Injection
        const totalMillion = totalAnnualCost / 1000000;

        this.container.innerHTML = `
            <div class="dashboard-container">
                <div class="action-bar-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h2 class="result-title" style="margin:0;"><i class="fa-solid fa-flask"></i> Operation Cost (Variable)</h2>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-secondary" onclick="detailedOpexApp.loadPresetsWithConfirm()" title="Load Template Preset">
                            <i class="fa-solid fa-file-invoice"></i> Load Preset
                        </button>
                        <button class="btn btn-primary" onclick="detailedOpexApp.addCategory()">
                            <i class="fa-solid fa-folder-plus"></i> Add Category
                        </button>
                        <button class="btn btn-success" onclick="window.inputApps.userTriggerCalculate()">
                            <i class="fa-solid fa-calculator"></i> Calculate
                        </button>
                    </div>
                </div>

                <!-- Summary Section -->
                <div id="opex-summary" class="card" style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <h4 style="margin: 0; color: #1565c0;"><i class="fa-solid fa-calculator"></i> Variable Cost Summary</h4>
                            <p style="margin: 4px 0 0 0; font-size: 0.9em; color: #666;">Total estimated annual variable operation expenses</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.8em; font-weight: bold; color: #1565c0;">
                                ${totalAnnualCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} THB
                            </div>
                            <div style="font-size: 0.9em; color: #666;">
                                (${totalMillion.toFixed(2)} Million THB / Year)
                            </div>
                        </div>
                    </div>
                </div>

                <div id="opex-list" style="column-count: 2; column-gap: 20px;">
                    ${gridHtml}
                </div>
            </div>
            
            <div style="height: 100px;"></div>
        `;
    }

    add(categoryName = 'Others') {
        const newItem = {
            id: Date.now().toString(),
            category: categoryName,
            name: 'New Item',
            mode: 'manual', // manual, linked
            quantity: 1,
            unit: 'unit',
            freqType: 'monthly',
            price: 0,
            linkedSourceId: '',
            multiplier: 1
        };
        this.state.push(newItem);
        this.updateState();
        this.render();
    }

    addCategory() {
        const baseName = "New Category";
        let newName = baseName;
        let counter = 1;
        // Ensure unique name
        while (this.state.some(item => item.category === newName)) {
            newName = `${baseName} ${counter}`;
            counter++;
        }

        // Add an empty item to bootstrap the category
        this.add(newName);
    }

    renameCategory(oldName, newName) {
        if (!newName || newName.trim() === '') {
            newName = "Unnamed Category";
        }
        if (oldName === newName) return;

        // Change category across all items in that category
        this.state.forEach(item => {
            if (item.category === oldName) {
                item.category = newName;
            }
        });
        this.updateState();
        this.render();
    }

    remove(index) {
        this.state.splice(index, 1);
        this.updateState();
        this.render();
    }

    update(index, field, value) {
        this.state[index][field] = value;
        // If switching to linked, ensure defaults?
        this.updateState();
        this.render();
    }

    updateState() {
        if (window.inputApps) {
            window.inputApps.currentInputs.detailedOpex = this.state;
            // Also trigger re-render of linked items if reference changed?
            // Render handles it naturally.

            // Persist immediately so view switches/Calculate won't restore stale saved data
            if (window.StorageManager && typeof window.StorageManager.saveProject === 'function') {
                const state = {
                    view: 'detailed-opex',
                    lastModified: new Date().toISOString(),
                    inputs: window.inputApps.getInputs()
                };
                window.StorageManager.saveProject(state);
            }
        }
    }

    // --- Calculation Logic ---

    getQuantity(item) {
        if (item.mode === 'manual') {
            return parseFloat(item.quantity) || 0;
        } else if (item.mode === 'linked' && item.linkedSourceId) {
            const source = this.state.find(i => i.id === item.linkedSourceId);
            if (source) {
                // Recursively get source quantity (simple depth check naturally via call stack limit, but assume DAG)
                // Note: Frequency mismatch handling is tricky. links usually imply 'Quantity vs Quantity'.
                // If Water is 1000/day, and Waste is 80% linked, Waste Qty = 800/day.
                // Both inherit their own frequency logic for cost? Or does Waste inherit source freq?
                // Logic: "Quantity" is usually per "Frequency Cycle".
                // If Source=1000/Day, Linked Item usually implies "800/Day".
                // So Linked Item should PROBABLY inherit the Frequency Type of the source implicitly,
                // OR we just calculate the Annual Qty of source and apply %.

                // Let's stick to: Linked Item tracks quantity RELATIVE to source quantity,
                // but keeps its own frequency setting? Or inherits?
                // Use case: Water Supply (Daily). Waste Water (80% of Water).
                // It means Waste Water is generated daily too.

                // Simplest approach: Return raw unit quantity.
                return this.getQuantity(source) * (parseFloat(item.multiplier) || 0);
            }
        }
        return 0;
    }

    calculateItemCost(item) {
        const qty = this.getQuantity(item);
        const price = parseFloat(item.price) || 0;

        let freqMultiplier = 1;
        // Inherit frequency if linked? 
        // For MVP, enable Manual Frequency Selection even for linked items, 
        // OR auto-match source. 
        // Let's rely on user setting the frequency correctly for linked items for now (flexible).
        // e.g. If specific chem is added per water ton, it follows water freq.

        // Actually, if linked, it's safer to inherit source freq if we want "true" linking.
        // But let's check item.freqType.
        // If linked, usually same frequency.
        let fType = item.freqType;
        if (item.mode === 'linked' && item.linkedSourceId) {
            const source = this.state.find(i => i.id === item.linkedSourceId);
            if (source) fType = source.freqType;
        }

        if (fType === 'daily') freqMultiplier = (window.AppConfig?.defaults?.daysPerYear || 334);
        else if (fType === 'monthly') freqMultiplier = 12;
        else freqMultiplier = 1;

        return qty * price * freqMultiplier;
    }

    calculateTotalCost() {
        return this.state.reduce((sum, item) => sum + this.calculateItemCost(item), 0);
    }
}

window.detailedOpexApp = new DetailedOpexManager();
