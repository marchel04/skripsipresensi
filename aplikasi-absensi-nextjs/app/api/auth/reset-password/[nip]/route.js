import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const nip = params.nip;
        const body = await req.json();

        const backendRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/${nip}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: req.headers.get("cookie") || "",
                },
                body: JSON.stringify(body),
                credentials: "include",
            }
        );

        // Try to parse JSON, fallback to text if not JSON
        const contentType = backendRes.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            const data = await backendRes.json();
            return NextResponse.json(data, { status: backendRes.status });
        } else {
            const text = await backendRes.text();
            return new NextResponse(text, { status: backendRes.status });
        }
    } catch (error) {
        console.error("Error proxying reset-password:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}