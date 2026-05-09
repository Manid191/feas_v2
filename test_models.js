
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

// Copy PowerModel Logic
class PowerModel extends ModelStrategy {
    constructor() { super('Power Plant Model'); }
    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const basePeak = params.simPricePeak !== undefined ? params.simPricePeak : (inputs.revenue.peakRate || 0);
        const baseOffPeak = params.simPriceOffPeak !== undefined ? params.simPriceOffPeak : (inputs.revenue.offPeakRate || 0);
        const pricePeak = basePeak * escalationFactor;
        const priceOffPeak = baseOffPeak * escalationFactor;
        const simCapKW = simCapacity * 1000;
        const peakHrs = inputs.revenue.peakHours || 0;
        const offPeakHrs = (inputs.hoursPerDay || 24) - peakHrs;
        const powerFactor = inputs.powerFactor !== undefined ? inputs.powerFactor : 0.90;
        const genPeak = simCapKW * peakHrs * powerFactor;
        const genOffPeak = simCapKW * offPeakHrs * powerFactor;
        const dailyOutput = (genPeak + genOffPeak);
        const yearTotalEnergy = dailyOutput * days * degradationFactor;
        const revPeak = (genPeak * days * degradationFactor) * pricePeak;
        const revOffPeak = (genOffPeak * days * degradationFactor) * priceOffPeak;
        let yearBaseRevenue = revPeak + revOffPeak;
        return { revenue: yearBaseRevenue, totalEnergy: yearTotalEnergy };
    }
}

// Copy SolarModel Logic
class SolarModel extends ModelStrategy {
    constructor() { super('Solar Power Model'); }
    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;
        const simCapKW = (params.simCapacity !== undefined ? params.simCapacity : inputs.capacity) * 1000;
        const fitRate = params.simPricePeak !== undefined ? params.simPricePeak : (inputs.revenue.peakRate || 0);
        const sunHours = Math.max(0, inputs.hoursPerDay || 0);
        const powerFactor = inputs.powerFactor || 1;
        const annualOutput = simCapKW * sunHours * powerFactor * days * degradationFactor;
        const baseRevenue = annualOutput * fitRate * escalationFactor;
        return { revenue: baseRevenue, totalEnergy: annualOutput };
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


    // 3. Power Model Test
    console.log("\n[Test 3] Power Plant Model");
    const powerInputs = {
        capacity: 10, // MW => 10,000 kW
        powerFactor: 0.90,
        hoursPerDay: 24,
        revenue: {
            peakHours: 13,
            peakRate: 4.5, // THB/kWh
            offPeakRate: 2.6 // THB/kWh
        }
    };
    const powerParams = { degradationFactor: 1.0, escalationFactor: 1.0, days: 365 };
    const powerModel = new PowerModel();
    const powerRes = powerModel.calculateRevenue(powerInputs, 1, powerParams);

    // Manual Calc
    // Peak: 10,000 * 13 * 0.90 = 117,000 kWh/day
    // OffPeak: 10,000 * 11 * 0.90 = 99,000 kWh/day
    // Total kWh/day = 216,000 => Annual = 216,000 * 365 = 78,840,000 kWh
    // Rev Peak: 117,000 * 365 * 4.5 = 192,172,500
    // Rev OffPeak: 99,000 * 365 * 2.6 = 93,951,000
    // Total Rev = 286,123,500
    const expectedPowerVol = 78840000;
    const expectedPowerRev = 286123500;

    console.log(`Expected Vol: ${expectedPowerVol}, Got: ${powerRes.totalEnergy}`);
    console.log(`Expected Rev: ${expectedPowerRev}, Got: ${powerRes.revenue}`);

    if (Math.abs(powerRes.revenue - expectedPowerRev) < 0.1) console.log("✅ Power Model Passed");
    else console.error("❌ Power Model Failed");


    // 4. Solar Model Test
    console.log("\n[Test 4] Solar Power Model");
    const solarInputs = {
        capacity: 5, // MW => 5,000 kW
        powerFactor: 1.0,
        hoursPerDay: 4.5, // Sun Hours
        revenue: {
            peakRate: 2.2 // FiT Rate
        }
    };
    const solarParams = { degradationFactor: 1.0, escalationFactor: 1.0, days: 365 };
    const solarModel = new SolarModel();
    const solarRes = solarModel.calculateRevenue(solarInputs, 1, solarParams);

    // Manual Calc
    // Output: 5,000 * 4.5 * 1.0 * 365 = 8,212,500 kWh
    // Rev: 8,212,500 * 2.2 = 18,067,500
    const expectedSolarVol = 8212500;
    const expectedSolarRev = 18067500;

    console.log(`Expected Vol: ${expectedSolarVol}, Got: ${solarRes.totalEnergy}`);
    console.log(`Expected Rev: ${expectedSolarRev}, Got: ${solarRes.revenue}`);

    if (Math.abs(solarRes.revenue - expectedSolarRev) < 0.1) console.log("✅ Solar Model Passed");
    else console.error("❌ Solar Model Failed");
}

runTests();
