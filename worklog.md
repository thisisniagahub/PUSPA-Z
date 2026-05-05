---
Task ID: 1-6
Agent: Main
Task: Fix all UI/UX issues - overflow, sizing, text, scrollbar problems

Work Log:
- Audited all major UI components (ai-chat-panel, ai/page, app-header, app-sidebar, dashboard)
- Found 20+ UI/UX issues: reversed responsive sizing, nested scroll containers, text too small, missing view titles, inline style conflicts
- Rewrote ai-chat-panel.tsx: removed nested overflow-y-auto, fixed reversed text sizes (text-sm sm:text-xs → consistent text-sm), widened desktop panel from w-80 to w-96, increased avatar from h-7 to h-8, added break-words for message text
- Rewrote ai/page.tsx: replaced hardcoded h-[calc(100vh-8rem)] with flex layout using min-h-0, removed nested overflow-y-auto inside ScrollArea, fixed all avatar/button sizes to be consistent (h-9 w-9 → h-9 w-9 on all screens, not shrinking on desktop), updated input to h-10 consistently
- Rewrote app-header.tsx: added missing view titles for asnafpreneur, sedekah-jumaat, docs; changed subtitle from text-[10px] to text-xs; added min-w-0 and truncate for overflow safety
- Rewrote app-sidebar.tsx: removed max-w-[260px] constraint (let SidebarProvider control width), increased footer role text from text-[10px] to text-[11px]
- Rewrote app/page.tsx: removed md:mr-80 margin shift when AI chat is open (chat panel is fixed positioned, margin creates gap), increased loading spinner logo from h-12 to h-16
- Fixed dashboard/page.tsx: removed inline scrollbarWidth style, increased timestamps from text-[10px] to text-xs, badge text from text-[10px] to text-[11px]
- Added scrollbar-none CSS utility and chat-message-content word-break class to globals.css

Stage Summary:
- All 6 UI/UX fix tasks completed
- No more reversed responsive sizes (mobile=small, desktop=big is correct now)
- No more nested scroll containers causing double scrollbars
- All text is readable (minimum 11px, most 12-14px)
- AI chat panel widened for desktop readability
- Missing view titles added for asnafpreneur, sedekah-jumaat, docs
- Lint passes clean, dev server compiles successfully
