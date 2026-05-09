class PowerModel extends ModelStrategy {
    constructor() {
        super('Power Plant Model');
    }

    calculateRevenue(inputs, year, params) {
        // Simulation Overrides (prioritize params over inputs)
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;

        // Tariff Schema Check
        const isFit = inputs.revenue.tariffType === 'FIT';

        // Power Logic (Capacity * Hours * Price)
        const simCapKW = simCapacity * 1000;

        let peakHrs, offPeakHrs;
        if (isFit) {
            peakHrs = inputs.hoursPerDay || 24;
            offPeakHrs = 0;
        } else {
            peakHrs = inputs.revenue.peakHours || 0;
            offPeakHrs = Math.max(0, (inputs.hoursPerDay || 24) - peakHrs);
        }

        const powerFactor = inputs.powerFactor !== undefined ? inputs.powerFactor : 0.90;
        const genPeakDaily = simCapKW * peakHrs * powerFactor;
        const genOffPeakDaily = simCapKW * offPeakHrs * powerFactor;

        // Delegate to unified ModelStrategy logic
        return this.calculateElectricityTariff(inputs, genPeakDaily, genOffPeakDaily, year, params);
    }
}
