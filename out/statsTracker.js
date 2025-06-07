"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsTracker = void 0;
class StatsTracker {
    constructor() {
        this.startTime = 0;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.errors = [];
        this.isTracking = false;
        // Initialize with default values
        this.reset();
    }
    startTracking() {
        this.startTime = Date.now();
        this.isTracking = true;
        // Update stats every second
        this.updateInterval = setInterval(() => {
            if (this.onStatsUpdated) {
                this.onStatsUpdated(this.getCurrentStats());
            }
        }, 1000);
    }
    stopTracking() {
        this.isTracking = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
    }
    reset() {
        this.startTime = 0;
        this.totalCharacters = 0;
        this.correctCharacters = 0;
        this.errors = [];
        this.isTracking = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
    }
    recordCharacter(expected, typed, position) {
        if (!this.isTracking)
            return;
        this.totalCharacters++;
        if (expected === typed) {
            this.correctCharacters++;
        }
        else {
            this.errors.push({
                position,
                expected,
                typed,
                timestamp: Date.now()
            });
        }
    }
    removeLastCharacter() {
        if (!this.isTracking || this.totalCharacters === 0)
            return;
        // Remove the last character from tracking
        this.totalCharacters--;
        // Check if the last character was an error and remove it
        const lastError = this.errors[this.errors.length - 1];
        if (lastError && lastError.position === this.totalCharacters) {
            this.errors.pop();
        }
        else if (this.correctCharacters > 0) {
            this.correctCharacters--;
        }
    }
    getCurrentStats() {
        const timeElapsed = this.isTracking ? (Date.now() - this.startTime) / 1000 : 0;
        const minutes = Math.max(timeElapsed / 60, 1 / 60); // Minimum 1 second for calculation
        // Calculate WPM (assuming average word length of 5 characters)
        const wpm = Math.round((this.correctCharacters / 5) / minutes);
        // Calculate CPM (Characters Per Minute)
        const cpm = Math.round(this.correctCharacters / minutes);
        // Calculate accuracy
        const accuracy = this.totalCharacters > 0
            ? Math.round((this.correctCharacters / this.totalCharacters) * 100)
            : 100;
        return {
            wpm: Math.max(0, wpm),
            cpm: Math.max(0, cpm),
            accuracy: Math.max(0, Math.min(100, accuracy)),
            errors: this.errors.length,
            totalCharacters: this.totalCharacters,
            correctCharacters: this.correctCharacters,
            timeElapsed: Math.round(timeElapsed)
        };
    }
    getErrorsInRange(startPosition, endPosition) {
        return this.errors.filter(error => error.position >= startPosition && error.position <= endPosition);
    }
    getRecentErrors(seconds = 10) {
        const cutoffTime = Date.now() - (seconds * 1000);
        return this.errors.filter(error => error.timestamp >= cutoffTime);
    }
    onStatsUpdate(callback) {
        this.onStatsUpdated = callback;
    }
    isActive() {
        return this.isTracking;
    }
    getSessionSummary() {
        const stats = this.getCurrentStats();
        return {
            duration: stats.timeElapsed,
            totalCharacters: this.totalCharacters,
            correctCharacters: this.correctCharacters,
            errors: this.errors.length,
            averageWpm: stats.wpm,
            finalAccuracy: stats.accuracy
        };
    }
    dispose() {
        this.stopTracking();
    }
}
exports.StatsTracker = StatsTracker;
//# sourceMappingURL=statsTracker.js.map