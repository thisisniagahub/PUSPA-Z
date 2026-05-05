---
Task ID: 1
Agent: Main Agent
Task: Refactor sidebar to show icons on hover when collapsed

Work Log:
- Analyzed current sidebar implementation (custom aside element that disappears when closed)
- Refactored app-sidebar.tsx to use shadcn/ui Sidebar primitives with `collapsible="icon"` mode
- Updated page.tsx to wrap layout in SidebarProvider + SidebarInset for proper sidebar context
- Updated app-header.tsx to use SidebarTrigger component instead of custom Menu button toggle
- Fixed Separator import (was incorrectly from lucide-react, should be from @/components/ui/separator)
- Cleaned up Zustand store - removed sidebarOpen/setSidebarOpen/toggleSidebar (now managed by SidebarProvider)
- Verified page loads with HTTP 200 and lint passes clean

Stage Summary:
- Sidebar now collapses to icon-only mode (3rem width) when toggle is clicked
- Each icon shows a tooltip on hover with the module name (e.g. "Dashboard — Papan Pemuka")
- SidebarRail added for drag-to-resize/toggle functionality
- SidebarTrigger in header for expand/collapse toggle
- All navigation groups and role-based access control preserved
