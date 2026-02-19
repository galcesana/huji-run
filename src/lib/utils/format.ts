// format.ts

export function formatDistance(meters: number): string {
    return (meters / 1000).toFixed(2) + ' km'
}

export function formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatPace(speedMps: number): string {
    if (!speedMps || speedMps === 0) return '0:00 /km'

    // Pace is inverse of speed. 1 / (m/s) = s/m.
    // To get mins/km: (1000 meters / speedMps) / 60
    const secondsPerKm = 1000 / speedMps
    const mins = Math.floor(secondsPerKm / 60)
    const secs = Math.floor(secondsPerKm % 60)

    return `${mins}:${secs.toString().padStart(2, '0')} /km`
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`
    } else if (diffHours < 24) {
        return `${diffHours}h ago`
    } else if (diffDays < 7) {
        return `${diffDays}d ago`
    } else {
        return date.toLocaleDateString()
    }
}
