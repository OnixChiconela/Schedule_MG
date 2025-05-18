export function getRemainingUses(): number {
    const raw = localStorage.getItem("ai-usage");
    const today = new Date().toISOString().split("T")[0];

    if (!raw) return 5;

    const { date, count } = JSON.parse(raw);
    return date === today ? Math.max(0, 5 - count) : 5;
}