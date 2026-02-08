/**
 * StorageManager
 * Handles saving/loading project data to localStorage and enforcing the 10-file limit.
 */
const StorageManager = {
    PREFIX: 'feasibility_project_',
    MAX_SAVES: 10,

    /**
     * Save the current project state.
     * @param {Object} data - The project data object.
     */
    saveProject: function (data) {
        try {
            const timestamp = Date.now();
            const key = `${this.PREFIX}${timestamp}`;
            const packet = {
                id: key,
                timestamp: new Date().toISOString(),
                data: data
            };

            localStorage.setItem(key, JSON.stringify(packet));

            this.cleanupOldSaves();
            return true;
        } catch (error) {
            console.error('[Storage] Save failed:', error);
            // Handle quota exceeded error ideally
            return false;
        }
    },

    /**
     * Delete old saves, keeping only the latest MAX_SAVES (10).
     */
    cleanupOldSaves: function () {
        const saves = this.getAllSaves();

        if (saves.length > this.MAX_SAVES) {
            // Sort by timestamp descending (newest first)
            saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Newest first

            // Identify files to remove (those after the 10th item)
            const toRemove = saves.slice(this.MAX_SAVES);

            toRemove.forEach(save => {
                localStorage.removeItem(save.id);
            });
        }
    },

    /**
     * Retrieve all saved projects.
     * @returns {Array} Array of save objects (id, timestamp, data).
     */
    getAllSaves: function () {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.PREFIX)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    saves.push(item);
                } catch (e) {
                    console.warn(`[Storage] Corrupt save skipped: ${key}`);
                }
            }
        }
        return saves;
    },

    /**
     * Load the most recent project data.
     */
    loadLatestProject: function () {
        const saves = this.getAllSaves();
        if (saves.length === 0) return null;

        // Sort descending
        saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return saves[0].data;
    },

    /**
     * Delete all project saves.
     */
    deleteAllSaves: function () {
        const saves = this.getAllSaves();
        saves.forEach(save => {
            localStorage.removeItem(save.id);
        });
    }
};

// Expose to window for global access if needed, or just use `StorageManager`
window.StorageManager = StorageManager;
