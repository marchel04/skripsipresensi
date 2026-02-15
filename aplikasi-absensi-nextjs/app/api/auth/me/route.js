import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: req.headers.get("cookie") || "",
                },
                credentials: "include",
            }
        );

        // Try to read text first (protect against empty body)
        const text = await backendRes.text();
        if (!text) {
            console.error("Empty response body from backend /auth/me", { status: backendRes.status });
            return NextResponse.json({ success: false, message: "Empty response from backend" }, { status: 502 });
        }

        try {
            const data = JSON.parse(text);
            console.log("Response from /me:", data);
            return NextResponse.json(data, { status: backendRes.status });
        } catch (parseError) {
            console.error("Failed to parse JSON from backend /auth/me", parseError, text);
            return NextResponse.json({ success: false, message: "Invalid JSON from backend" }, { status: 502 });
        }
    } catch (error) {
        console.error("Error fetching /me:", error);
        return NextResponse.json(
            {
                success: false,
                message: error?.message || "Gagal mengambil data user",
            },
            { status: 502 }
        );
    }
}
