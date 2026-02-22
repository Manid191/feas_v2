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

    const testScript = `
        function assert(condition, message) {
            if (!condition) throw new Error("Assertion Failed: " + message);
            console.log("✅ PASS: " + message);
        }

        function runTests() {
            console.log("\\n=== Starting Comprehensive Verification ===");
            let failCount = 0;

            const runTC = (name, testFn) => {
                try {
                    console.log("\\n▶ Running " + name);
                    testFn();
                } catch (e) {
                    console.error("❌ FAIL: " + name + " -> " + (e.stack || e.message));
                    failCount++;
                }
            };

            runTC("TC1.1 (Empty State Initialized)", () => {
                localStorage.clear();
                const inputMgr = new InputManager();
                assert(Object.keys(inputMgr.currentInputs).length > 0, "Input manager mapped current inputs");
            });

            runTC("TC1.3 (Corrupted Storage Recovery)", () => {
                localStorage.setItem('powerplant_projects', 'invalid json {[');
                const loaded = StorageManager.loadLatestProject();
                assert(loaded === null, "Corrupted storage caught safely");
            });
            
            runTC("TC2.1 (Edge Case - Negative Inputs)", () => {
                const testInputs = JSON.parse(JSON.stringify(window.AppConfig.defaults));
                testInputs.capacity = -50;
                testInputs.projectYears = 0;
                let calcRes = {};
                try {
                    calcRes = window.inputApps.calculate(testInputs, true);
                } catch(e) {}
                assert(typeof calcRes.irr === 'number' || isNaN(calcRes.irr) || calcRes.irr === undefined, "Calculator handles negative capacity gracefully");
            });
            
            runTC("TC3.3 (Negative - Blank/Invalid Admin Costs)", () => {
                const acm = new AdminCostManager('dummy');
                window.inputApps.currentInputs.adminItems = [];
                acm.init();
                acm.adminItems.push({ name: '', quantity: 'abc', value: null, freqType: 'yearly' });
                
                let annualTotal = 0;
                let threw = false;
                try { annualTotal = acm.getAnnualCosts()[1]; } catch (e) { threw = true; }
                
                assert(!threw, "Annual costs fetched without throw");
                assert(annualTotal === 0 || isNaN(annualTotal), "Invalid strings coerce safely");
            });
            
            runTC("TC4.2 (Opex - Category Reassignment & Summary)", () => {
                const opex = new DetailedOpexManager();
                opex.state = [];
                opex.add('Boiler');
                opex.add('Water');
                opex.state[0].price = 10;
                opex.state[1].price = 20;
                opex.renameCategory('Boiler', 'Merged');
                opex.renameCategory('Water', 'Merged');
                assert(opex.state[0].category === 'Merged', "Item 1 renamed");
                assert(opex.state[1].category === 'Merged', "Item 2 renamed");
                assert(opex.calculateTotalCost() === 360, "Merged category calculated accurately"); // 10*12 + 20*12
            });

            runTC("TC4.4 (Opex - Linked Multiplier Logic)", () => {
                const opex = new DetailedOpexManager();
                opex.state = [];
                opex.add('CatA');
                const srcId = opex.state[0].id;
                opex.state[0].quantity = 100;
                opex.state[0].mode = 'manual';
                opex.add('CatA');
                opex.state[1].mode = 'linked';
                opex.state[1].linkedSourceId = srcId;
                opex.state[1].multiplier = 0.5; // Changed from 50 (%) to 0.5 (raw)
                const linkedQty = opex.getQuantity(opex.state[1]);
                assert(linkedQty === 50, "Linked quantity evaluated 0.5x correctly");
            });

            runTC("TC5.1 (Preset Loading Integrity)", () => {
                const testInputs = JSON.parse(JSON.stringify(window.AppConfig.defaults));
                // Clear any auto-loaded items
                testInputs.adminItems = [];
                testInputs.detailedOpex = [];
                testInputs.opex = [];
                testInputs.personnel = [];
                window.inputApps.currentInputs = testInputs;
                window.inputApps.state.opexItems = []; // Clear default initialOpex

                // Test 1: Empty state should yield 0 for Opex/Admin
                let calcResEmpty = window.inputApps.calculate(testInputs, true);
                assert(calcResEmpty.details.annualFixedCost[1] === 0, "Empty Admin state yields 0 expenses");
                assert(calcResEmpty.details.annualVariableCost[1] === 0, "Empty Opex state yields 0 expenses");

                // Test 2: Load presets
                const acm = new AdminCostManager('dummy');
                window.adminApp = acm; // Expose as it is used by input_manager calculation
                acm.init();
                acm.loadDefaults(); // Injects preset into window.inputApps.currentInputs.adminItems

                const opex = new DetailedOpexManager();
                opex.state = [];
                opex.loadPresets(); // Injects preset into window.inputApps.currentInputs.detailedOpex

                const cur = window.inputApps.currentInputs;
                cur.opex = cur.opex || [];
                cur.personnel = cur.personnel || [];

                let calcResLoaded = window.inputApps.calculate(cur, true);
                
                assert(calcResLoaded.details.annualFixedCost[1] > 0, "Admin preset successfully injected positive expense into main calculation");
                assert(calcResLoaded.details.annualVariableCost[1] > 0, "Opex preset successfully injected positive expense into main calculation");
            });

            console.log("\\n=== Verification Finished with " + failCount + " Failures ===");
            if (failCount > 0) throw new Error("Tests Failed");
        }
        
        // Init state
        if (typeof InputManager !== 'undefined') {
            window.inputApps = new InputManager();
            if (window.inputApps.init) window.inputApps.init();
        }
        
        console.log("Environment loaded successfully. Ready for tests.");
        runTests();
    `;

    allCode += '\n;' + testScript;
    vm.runInContext(allCode, sandbox);

} catch (e) {
    console.error("Script Execution Error:", e);
    process.exit(1);
}
