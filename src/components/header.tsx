import { SidebarTrigger } from "./ui/sidebar";

export function Header(){
    return (
        <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger/>
            <h1 className="text-lg font-semibold">GrãoSeguro Dashboard</h1>
            <div></div> {/* Placeholder para alinhamento */}
        </header>
    )
}