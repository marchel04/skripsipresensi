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

        const data = await backendRes.json();

        console.log("Response from /me:", data);

        return NextResponse.json(data, {
            status: backendRes.status,
        });
    } catch (error) {
        console.error("Error fetching /me:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Gagal mengambil data user",
            },
            { status: 500 }
        );
    }
}
