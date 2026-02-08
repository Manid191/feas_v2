class PowerModel extends ModelStrategy {
    constructor() {
        super('Power and Solar Model');
    }

    calculateRevenue(inputs, year, params) {
        const { degradationFactor, escalationFactor, days } = params;

        // Simulation Overrides (prioritize params over inputs)
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;

        // Base Prices
        const basePeak = params.simPricePeak !== undefined ? params.simPricePeak : (inputs.revenue.peakRate || 0);
        const baseOffPeak = params.simPriceOffPeak !== undefined ? params.simPriceOffPeak : (inputs.revenue.offPeakRate || 0);

        // Apply Escalation
        const pricePeak = basePeak * escalationFactor;
        const priceOffPeak = baseOffPeak * escalationFactor;

        // Power Logic (Capacity * Hours * Price)
        const simCapKW = simCapacity * 1000;
        const peakHrs = inputs.revenue.peakHours || 0;
        const offPeakHrs = (inputs.hoursPerDay || 24) - peakHrs;

        const powerFactor = inputs.powerFactor !== undefined ? inputs.powerFactor : 0.90;
        const genPeak = simCapKW * peakHrs * powerFactor;
        const genOffPeak = simCapKW * offPeakHrs * powerFactor;

        // Total Output (kWh)
        const dailyOutput = (genPeak + genOffPeak);
        const yearTotalEnergy = dailyOutput * days * degradationFactor;

        // Revenue
        const revPeak = (genPeak * days * degradationFactor) * pricePeak;
        const revOffPeak = (genOffPeak * days * degradationFactor) * priceOffPeak;

        let yearBaseRevenue = revPeak + revOffPeak;

        // Adder Logic
        const adderPrice = inputs.revenue.adderPrice || 0;
        const adderYears = inputs.revenue.adderYears || 0;

        if (year <= adderYears) {
            yearBaseRevenue += (yearTotalEnergy * adderPrice);
        }

        return {
            revenue: yearBaseRevenue,
            totalEnergy: yearTotalEnergy
        };
    }
}
