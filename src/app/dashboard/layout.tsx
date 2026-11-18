import { redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { currentUser } from "../../../modules/auth/actions/current-user";
import { getAllPlaygroundForUser } from "../../../modules/dashboard/actions";
import { DashboardSidebar } from "../../../modules/dashboard/components/dashboard-sidebar";

export default async function DashboardLayout({
    children
}:{
    children:React.ReactNode
})
{
    // Protect route: Redirect to sign-in page if user is not authenticated
    const user = await currentUser();
    if (!user) {
        redirect("/auth/sign-in");
    }

    const playgroundData = await getAllPlaygroundForUser();

    const technologyIconMap: Record<string, string> = {
        REACT: "zap",
        NEXTJS: "Lightbulb",
        EXPRESS: "Database",
        VUE: "Compass",
        HONO: "FlameIcon",
        ANGULAR: "Terminal",
    };

    const formattedPlaygrounddata = playgroundData?.map((item) => ({
        id: item.id,
        name: item.title,
        starred: item.Starmark?.[0]?.isMarked || false,
        icon: technologyIconMap[item.template] || "code2"
    })) ?? [];

    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full overflow-x-hidden">
                    <DashboardSidebar initialPlaygroundData={formattedPlaygrounddata} />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}
