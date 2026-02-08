
// Mock Dependencies
window = {
    AppConfig: {
        constants: { defaultProjectYears: 20, discountRate: 0.07 }
    }
};

class ModelStrategy {
    constructor(name) { this.name = name; }
    calculateRevenue(inputs, year, params) { throw new Error("Method 'calculateRevenue' must be implemented."); }
}

// Copy WaterModel Logic
class WaterModel extends ModelStrategy {
    constructor() { super('Water Supply Model'); }
    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const dailyOutput = simCapacity;
        const annualOutput = dailyOutput * days;
        const lossPct = (inputs.revenue.lossRate || 0) / 100;
        const effectiveOutput = annualOutput * degradationFactor * (1 - lossPct);
        const unitPrice = (inputs.revenue.unitPrice || 0) * escalationFactor;
        const yearBaseRevenue = effectiveOutput * unitPrice;
        return { revenue: yearBaseRevenue, totalEnergy: effectiveOutput };
    }
}

// Copy WasteModel Logic
class WasteModel extends ModelStrategy {
    constructor() { super('Waste Disposal Model'); }
    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const dailyIntake = simCapacity;
        const annualIntake = dailyIntake * days;
        const effectiveIntake = annualIntake * degradationFactor;
        const tippingFee = (inputs.revenue.tippingFee || 0) * escalationFactor;
        const yearBaseRevenue = effectiveIntake * tippingFee;
        return { revenue: yearBaseRevenue, totalEnergy: effectiveIntake };
    }
}

// Test Suite
function runTests() {
    console.log("--- Starting Verification Tests ---");

    // 1. Water Model Test
    console.log("\n[Test 1] Water Supply Model");
    const waterInputs = {
        capacity: 1000, // m3/day
        daysPerYear: 365,
        revenue: {
            unitPrice: 10, // THB/m3
            lossRate: 5    // 5% loss
        }
    };
    const waterParams = { degradationFactor: 1.0, escalationFactor: 1.0, days: 365 };
    const waterModel = new WaterModel();
    const waterRes = waterModel.calculateRevenue(waterInputs, 1, waterParams);

    const expectedWaterVol = 1000 * 365 * (1 - 0.05); // 346,750
    const expectedWaterRev = expectedWaterVol * 10;   // 3,467,500

    console.log(`Expected Vol: ${expectedWaterVol}, Got: ${waterRes.totalEnergy}`);
    console.log(`Expected Rev: ${expectedWaterRev}, Got: ${waterRes.revenue}`);

    if (Math.abs(waterRes.revenue - expectedWaterRev) < 0.1) console.log("✅ Water Model Passed");
    else console.error("❌ Water Model Failed");


    // 2. Waste Model Test
    console.log("\n[Test 2] Waste Disposal Model");
    const wasteInputs = {
        capacity: 50, // Tons/day
        daysPerYear: 365,
        revenue: {
            tippingFee: 500 // THB/Ton
        }
    };
    const wasteParams = { degradationFactor: 1.0, escalationFactor: 1.0, days: 365 };
    const wasteModel = new WasteModel();
    const wasteRes = wasteModel.calculateRevenue(wasteInputs, 1, wasteParams);

    const expectedWasteVol = 50 * 365; // 18,250
    const expectedWasteRev = expectedWasteVol * 500; // 9,125,000

    console.log(`Expected Vol: ${expectedWasteVol}, Got: ${wasteRes.totalEnergy}`);
    console.log(`Expected Rev: ${expectedWasteRev}, Got: ${wasteRes.revenue}`);

    if (Math.abs(wasteRes.revenue - expectedWasteRev) < 0.1) console.log("✅ Waste Model Passed");
    else console.error("❌ Waste Model Failed");
}

runTests();
