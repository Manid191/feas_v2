class SolarModel extends ModelStrategy {
    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;

        const simCapKW = (params.simCapacity !== undefined ? params.simCapacity : inputs.capacity) * 1000;
        const fitRate = params.simPricePeak !== undefined ? params.simPricePeak : (inputs.revenue.peakRate || 0);
        const sunHours = Math.max(0, inputs.hoursPerDay || 0);
        const powerFactor = inputs.powerFactor || 1;

        const annualOutput = simCapKW * sunHours * powerFactor * days * degradationFactor;
        const baseRevenue = annualOutput * fitRate * escalationFactor;

        let adderRev = 0;
        if (year <= (inputs.revenue.adderYears || 0)) {
            adderRev = annualOutput * (inputs.revenue.adderPrice || 0);
        }

        return {
            revenue: baseRevenue + adderRev,
            totalEnergy: annualOutput
        };
    }
}
