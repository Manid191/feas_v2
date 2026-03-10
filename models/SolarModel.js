class SolarModel extends ModelStrategy {
    calculateRevenue(inputs, year, params) {
        // Simulation Overrides
        const simCapacity = params.simCapacity !== undefined ? params.simCapacity : inputs.capacity;
        const simCapKW = simCapacity * 1000;

        // Solar specific inputs mapping
        const sunHours = Math.max(0, inputs.hoursPerDay || 0);
        const powerFactor = inputs.powerFactor || 1;

        // Peak Generation (Assume all solar hours happen during Peak daytime)
        const genPeakDaily = simCapKW * sunHours * powerFactor;
        const genOffPeakDaily = 0; // Solar typically doesn't generate at night

        // Delegate to unified ModelStrategy logic
        return this.calculateElectricityTariff(inputs, genPeakDaily, genOffPeakDaily, year, params);
    }
}
