import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NotesProvider } from "@/contexts/notes-context";
import { TasksProvider } from "@/contexts/tasks-context";
import { TodosProvider } from "@/contexts/todos-context";


export default function layout({ children }: { children: React.ReactNode}) {
    return (
    <NotesProvider>
      <TasksProvider>
        <TodosProvider>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            {children}
          </SidebarInset>
        </SidebarProvider>
        </TodosProvider>
      </TasksProvider>
    </NotesProvider>
    )
}
