import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    const formData = await req.formData();

    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pegawai/update/foto`,
      {
        method: "PATCH",
        body: formData,
        headers: {
          Cookie: req.headers.get("cookie") || "",
        },
        credentials: "include",
      },
    );

    const data = await backendRes.json();

    return NextResponse.json(data, {
      status: backendRes.status,
    });
  } catch (error) {
    console.error("PATCH foto profil error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal upload foto profil",
      },
      { status: 500 },
    );
  }
}
