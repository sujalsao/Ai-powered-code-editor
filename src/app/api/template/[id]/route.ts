import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { TEMPLATES_BUNDLE } from "@/lib/templates-bundle";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!id) {
        return Response.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const playground = await db.playground.findUnique({ where: { id } });
    if (!playground) {
        return Response.json({ error: "Playground not found" }, { status: 404 });
    }

    const templateKey = playground.template;
    const templateData = TEMPLATES_BUNDLE[templateKey] || TEMPLATES_BUNDLE["REACT"];

    if (!templateData) {
        return Response.json({ error: `Template ${templateKey} not found` }, { status: 404 });
    }

    return Response.json({ success: true, templateJson: templateData }, { status: 200 });
}
