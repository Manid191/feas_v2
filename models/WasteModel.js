class WasteModel extends ModelStrategy {
    constructor() {
        super('Waste Disposal Model');
    }

    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;

        // Waste Logic (Intake * Tipping Fee)
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const dailyIntake = simCapacity; // Tons/day
        const annualIntake = dailyIntake * days;

        // Effective Intake
        // Degradation might mean machine downtime, reducing intake capacity
        const effectiveIntake = annualIntake * degradationFactor;

        // Pricing
        const tippingFee = (inputs.revenue.tippingFee || 0) * escalationFactor;

        const yearBaseRevenue = effectiveIntake * tippingFee;

        return {
            revenue: yearBaseRevenue,
            totalEnergy: effectiveIntake // representing Mass (Tons)
        };
    }
}
