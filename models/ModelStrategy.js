class ModelStrategy {
    constructor(name) {
        this.name = name;
    }

    /**
     * Calculates revenue and energy input/output for a specific year.
     * @param {Object} inputs - The full inputs object
     * @param {number} year - The current project year (1-based)
     * @param {Object} params - Context params { degradationFactor, escalationFactor, days }
     * @returns {Object} { revenue, totalEnergy }
     */
    calculateRevenue(inputs, year, params) {
        throw new Error("Method 'calculateRevenue' must be implemented.");
    }
}
