import * as vscode from 'vscode';

export interface TypingStats {
    wpm: number;
    cpm: number;
    accuracy: number;
    errors: number;
    totalCharacters: number;
    correctCharacters: number;
    timeElapsed: number; // in seconds
}

export interface ErrorInfo {
    position: number;
    expected: string;
    typed: string;
    timestamp: number;
}

export class StatsTracker {
    private startTime: number = 0;
    private totalCharacters: number = 0;
    private correctCharacters: number = 0;
    private errors: ErrorInfo[] = [];
    private isTracking: boolean = false;
    private updateInterval: NodeJS.Timer | undefined;
    private onStatsUpdated: ((stats: TypingStats) => void) | undefined;

    constructor() {
        // Initialize with default values
        this.reset();
    }

    public startTracking(): void {
        this.startTime = Date.now();
        this.isTracking = true;
        
        // Update stats every second
        this.updateInterval = setInterval(() => {
            if (this.onStatsUpdated) {
                this.onStatsUpdated(this.getCurrentStats());
            }
        }, 1000);
    }

    public stopTracking(): void {
        this.isTracking = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = undefined;
        }
    }

    public reset(): void {
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

    public recordCharacter(expected: string, typed: string, position: number): void {
        if (!this.isTracking) return;

        this.totalCharacters++;
        
        if (expected === typed) {
            this.correctCharacters++;
        } else {
            this.errors.push({
                position,
                expected,
                typed,
                timestamp: Date.now()
            });
        }
    }

    public removeLastCharacter(): void {
        if (!this.isTracking || this.totalCharacters === 0) return;

        // Remove the last character from tracking
        this.totalCharacters--;
        
        // Check if the last character was an error and remove it
        const lastError = this.errors[this.errors.length - 1];
        if (lastError && lastError.position === this.totalCharacters) {
            this.errors.pop();
        } else if (this.correctCharacters > 0) {
            this.correctCharacters--;
        }
    }

    public getCurrentStats(): TypingStats {
        const timeElapsed = this.isTracking ? (Date.now() - this.startTime) / 1000 : 0;
        const minutes = Math.max(timeElapsed / 60, 1/60); // Minimum 1 second for calculation
        
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

    public getErrorsInRange(startPosition: number, endPosition: number): ErrorInfo[] {
        return this.errors.filter(error => 
            error.position >= startPosition && error.position <= endPosition
        );
    }

    public getRecentErrors(seconds: number = 10): ErrorInfo[] {
        const cutoffTime = Date.now() - (seconds * 1000);
        return this.errors.filter(error => error.timestamp >= cutoffTime);
    }

    public onStatsUpdate(callback: (stats: TypingStats) => void): void {
        this.onStatsUpdated = callback;
    }

    public isActive(): boolean {
        return this.isTracking;
    }

    public getSessionSummary(): {
        duration: number;
        totalCharacters: number;
        correctCharacters: number;
        errors: number;
        averageWpm: number;
        finalAccuracy: number;
    } {
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

    public dispose(): void {
        this.stopTracking();
    }
} 