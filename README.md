# Acquisitions Walkthrough

Mobile-first Next.js web application for real estate acquisitions and investment teams to manage property walkthroughs in the field.

## Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **Shadcn UI** (Button, Badge, Card)
- **TypeScript**

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on a mobile device or use browser dev tools with a mobile viewport.

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Dashboard (home)
│   └── walkthrough/
│       ├── layout.tsx              # Walkthrough route group layout
│       ├── new/page.tsx            # Start new walkthrough
│       └── [id]/page.tsx           # Active walkthrough detail
├── components/
│   ├── dashboard/                  # Dashboard UI
│   ├── layout/                     # App shell
│   └── ui/                         # Shadcn primitives
└── lib/
    └── mock-walkthroughs.ts        # Mock active walkthrough data
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Main dashboard with active walkthroughs |
| `/walkthrough/new` | Start a new property walkthrough |
| `/walkthrough/[id]` | View / resume an active walkthrough |

## Design

- Dark mode enabled by default (CSS variables, `prefers-color-scheme` viewport theme)
- Mobile-native patterns: sticky header, sticky bottom CTA, safe-area insets, touch-friendly tap targets (min 44px)
- Max content width `max-w-lg` for phone-first layout
