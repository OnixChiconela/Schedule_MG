import { NextResponse } from "next/server"

export async function GET() {
    // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const baseUrl = "https://scheuor.vercel.app"

    const pages = [
        "",
        "dashboard",
        "collaboration-space",
        "collaboration-space/collaboration",
        "tasks",
        "my-space",
        "my-space/settings",
        "my-space/settings/account",
        "my-space/settings/billing",
        "smart/smart-notes",
        "feedback"
    ]

    const sitemap = `<?xml version="1.0" enconding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9>
        ${pages
            .map(
                (page) => `
                <url>
                  <loc>${baseUrl}/${page}</loc>
                  <lastmod>${new Date().toString()}</lastmod>
                  <priority>${page === "" ? "1.0" : "0.8"}</priority>
                </url>
            `
            )
            .join("")
        } 
    </urlset>
    `

    return new NextResponse(sitemap, {
        headers: {
            "Content-Type": "text/xml"
        }
    })
}