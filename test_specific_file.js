const fs = require('fs');
const path = require('path');
const vm = require('vm');

const sandbox = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    document: {
        getElementById: () => ({ innerHTML: '', value: '', addEventListener: () => { }, querySelector: () => ({ addEventListener: () => { } }) }),
        createElement: () => ({ style: {}, classList: { add: () => { }, remove: () => { } }, appendChild: () => { } }),
        querySelectorAll: () => ([]),
        addEventListener: () => { },
        body: { appendChild: () => { }, classList: { add: () => { } } }
    },
    alert: console.log,
    prompt: () => null,
    confirm: () => true,
    localStorage: {
        _data: {},
        getItem: function (key) { return this._data[key] || null; },
        setItem: function (key, val) { this._data[key] = String(val); },
        removeItem: function (key) { delete this._data[key]; },
        clear: function () { this._data = {}; }
    }
};

sandbox.window = sandbox;
vm.createContext(sandbox);

const files = [
    'config.js',
    'models/ModelStrategy.js',
    'models/PowerModel.js',
    'models/SolarModel.js',
    'models/WasteModel.js',
    'models/WaterModel.js',
    'calculator.js',
    'storage.js',
    'input_manager.js',
    'report_manager.js',
    'personnel_manager.js',
    'detailed_opex_manager.js',
    'admin_cost_manager.js',
    'financial_manager.js',
    'simulation_manager.js'
];

try {
    sandbox.Chart = function () { };
    sandbox.Chart.register = () => { };

    let allCode = '';
    for (let f of files) {
        allCode += fs.readFileSync(path.join(__dirname, f), 'utf8') + '\n;';
    }

    const testProjectJson = fs.readFileSync(path.join(__dirname, 'test_project.json'), 'utf8');

    const testScript = `
        function runTest() {
            console.log("\\n=== Starting Calculation for feasibility_project (5).json ===");
            try {
                const projectData = JSON.parse(\`${testProjectJson}\`);
                const inputs = projectData.inputs;
                
                // MIGRATION Logic just like input_manager.js
                const version = projectData.metadata ? projectData.metadata.version : '1.0';
                if (version === '1.0') {
                    if (inputs.detailedOpex) {
                        inputs.detailedOpex.forEach(item => {
                            if (item.mode === 'linked' && item.multiplier !== undefined) {
                                item.multiplier = parseFloat(item.multiplier) / 100;
                            }
                        });
                    }
                }

                // Initialize required managers
                const acm = new AdminCostManager('dummy');
                window.adminApp = acm;
                acm.init();
                // Load admin items if they exist, else load defaults
                if (inputs.adminItems && inputs.adminItems.length > 0) {
                    acm.adminItems = inputs.adminItems;
                } else {
                    acm.loadDefaults();
                }

                // If adminItems is missing from inputs, add it for compatibility
                if(!inputs.adminItems) inputs.adminItems = acm.adminItems;

                const opex = new DetailedOpexManager();
                if (inputs.detailedOpex && inputs.detailedOpex.length > 0) {
                    opex.state = inputs.detailedOpex;
                }

                // Force input manager state
                window.inputApps = new InputManager();
                window.inputApps.currentInputs = inputs;
                window.inputApps.state.opexItems = inputs.opex || [];
                
                console.log("Capex Array directly from JSON:", inputs.capex);
                let totalC = inputs.capex.construction + inputs.capex.machinery + inputs.capex.land + (inputs.capex.sharePremium || 0) + (inputs.capex.others || 0);
                console.log("Calculated manual basic total Capex:", totalC);

                const calcRes = window.inputApps.calculate(inputs, true);
                
                console.log("✅ PASS: Calculation completed without errors");
                console.log("-----------------------------------------");
                console.log("Project Years:", inputs.projectYears);
                console.log("Capacity:", inputs.capacity + " MW");
                console.log("-----------------------------------------");
                console.log("Financial Results:");
                console.log("Project IRR (%):", isNaN(calcRes.irr) ? "N/A" : calcRes.irr.toFixed(2));
                console.log("Equity IRR (%):", isNaN(calcRes.equityIrr) ? "N/A" : calcRes.equityIrr.toFixed(2));
                console.log("Project NPV (MB):", isNaN(calcRes.npv) ? "N/A" : (calcRes.npv / 1000000).toFixed(2));
                console.log("Cashflows Y0-Y5 (MB):", calcRes.cashFlows.slice(0, 6).map(v => (v/1000000).toFixed(2)).join(', '));
                console.log("Year 1 Revenue (MB):", (calcRes.details.annualRevenue[1] / 1000000).toFixed(2));
                console.log("Year 1 Opex (MB):", (calcRes.details.annualOpex[1] / 1000000).toFixed(2));
                console.log("Year 1 EBITDA (MB):", (calcRes.details.annualEbitda[1] / 1000000).toFixed(2));

            } catch (e) {
                console.error("❌ FAIL: Calculation threw an error ->", e.stack || e.message);
            }
        }
        
        runTest();
    `;

    allCode += '\n;' + testScript;
    vm.runInContext(allCode, sandbox);

} catch (e) {
    console.error("Script Execution Error:", e);
    process.exit(1);
}
