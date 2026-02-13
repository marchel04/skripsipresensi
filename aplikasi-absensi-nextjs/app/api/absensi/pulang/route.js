import { NextResponse } from "next/server";

export async function PUT(req) {
    const body = await req.json();

    const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/absensi/pulang`,
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

    const text = await backendRes.text();
    return NextResponse.json(JSON.parse(text), {
        status: backendRes.status,
    });
}
