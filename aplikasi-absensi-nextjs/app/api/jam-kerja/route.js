import { NextResponse } from "next/server";

export async function GET() {
    try {
        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const text = await backendRes.text();
        if (!text) {
            console.error("Empty response body from backend /jam-kerja", { status: backendRes.status });
            return NextResponse.json({ success: false, message: "Empty response from backend" }, { status: 502 });
        }

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: backendRes.status });
        } catch (parseError) {
            console.error("Failed to parse JSON from backend /jam-kerja", parseError, text);
            return NextResponse.json({ success: false, message: "Invalid JSON from backend" }, { status: 502 });
        }
    } catch (error) {
        console.error("Error fetching /jam-kerja:", error);
        return NextResponse.json({ success: false, message: error?.message || "Backend unreachable" }, { status: 502 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("POST BODY:", body);

        const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jam-kerja`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.get("cookie") || "",
            },
            body: JSON.stringify(body),
            credentials: "include",
        });

        console.log("BACKEND STATUS:", backendRes.status);

        const text = await backendRes.text();
        console.log("BACKEND RAW RESPONSE:", text);

        if (!text) {
            return NextResponse.json({ success: false, message: "Empty response from backend" }, { status: 502 });
        }

        try {
            return NextResponse.json(JSON.parse(text), { status: backendRes.status });
        } catch (parseError) {
            console.error("Failed to parse JSON from backend POST /jam-kerja", parseError, text);
            return NextResponse.json({ success: false, message: "Invalid JSON from backend" }, { status: 502 });
        }
    } catch (error) {
        console.error("Error in POST /jam-kerja proxy:", error);
        return NextResponse.json({ success: false, message: error?.message || "Request failed" }, { status: 502 });
    }
}

