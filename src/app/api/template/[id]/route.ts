import { readTemplateStructureFromJson, saveTemplateStructureToJson } from "../../../../../modules/playground/lib/path-to-json";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";
import fs from "fs/promises";

function validateJsonStrucutre(data: unknown): boolean {
    try {
        JSON.parse(JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Invalid JSON structure:", error);
        return false;
    }
}

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

    const inputPath = path.join(process.cwd(), templatePath);
    const outputFile = path.join(process.cwd(), `output/${templateKey}.json`);

    try {
        await saveTemplateStructureToJson(inputPath, outputFile);
        const result = await readTemplateStructureFromJson(outputFile);

        if (!validateJsonStrucutre(result)) {
            return Response.json({ error: "Invalid JSON structure" }, { status: 500 });
        }

        await fs.unlink(outputFile);
        return Response.json({ success: true, templateJson: result }, { status: 200 });
    } catch (error) {
        console.error("Error reading template file:", error);
        return Response.json({ error: "Error reading template file" }, { status: 500 });
    }
}