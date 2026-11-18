import { scanTemplateDirectory } from "../../../../../modules/playground/lib/path-to-json";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";

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

    const templateKey = playground.template as keyof typeof templatePaths;
    const templatePath = templatePaths[templateKey];
    if (!templatePath) {
        return Response.json({ error: "Template not found" }, { status: 404 });
    }

    // Strip leading slash if present for cross-platform path resolution
    const cleanPath = templatePath.startsWith("/") ? templatePath.slice(1) : templatePath;
    const inputPath = path.join(process.cwd(), cleanPath);

    try {
        // Directly scan directory into memory — zero disk writes needed on Vercel
        const result = await scanTemplateDirectory(inputPath);
        return Response.json({ success: true, templateJson: result }, { status: 200 });
    } catch (error) {
        console.error("Error reading template directory:", error);
        return Response.json({ error: "Error reading template file" }, { status: 500 });
    }
}
