class WaterModel extends ModelStrategy {
    constructor() {
        super('Water Supply Model');
    }

    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;

        // Water Logic (Volume * Price - Loss)
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const dailyOutput = simCapacity; // m3/day
        const annualOutput = dailyOutput * days;

        // Loss Rate
        const lossPct = (inputs.revenue.lossRate || 0) / 100;

        // Effective Output
        // Degradation in water model might represent equipment aging reducing throughput
        const effectiveOutput = annualOutput * degradationFactor * (1 - lossPct);

        // Pricing
        const unitPrice = (inputs.revenue.unitPrice || 0) * escalationFactor;

        const yearBaseRevenue = effectiveOutput * unitPrice;

        return {
            revenue: yearBaseRevenue,
            totalEnergy: effectiveOutput // representing Volume (m3)
        };
    }
}
