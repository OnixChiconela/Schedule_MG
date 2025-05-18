const MAX_DAILY_USES = 5
const STORAGE_KEY = "ai-usage"

export function canUseAI() {
    const raw = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toISOString().split("T")[0]

    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({date: today, count: 1}))
        return true
    }

    const { date, count } = JSON.parse(raw);

    if (date !== today) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }))
        return true
    }

    if (count < MAX_DAILY_USES) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date, count: count + 1 }))
        return true
    }

    return false
}