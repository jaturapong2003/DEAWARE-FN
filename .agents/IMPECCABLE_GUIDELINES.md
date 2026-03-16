# 💎 Impeccable Design & Development Guidelines

This document consolidates the core principles from the removed skill modules to ensure persistent quality in design and implementation.

## 1. Visual Aesthetics & UI
- **Modern Typography**: Use clean sans-serif fonts (e.g., Inter, Prompt, Outfit). Use responsive font sizes (no oversized text).
- **Refined Color Palette**: Avoid generic colors. Use curated OkLCH/HSL palettes and subtle gradients to create depth.
- **Glassmorphism**: Use `backdrop-blur` with low-opacity backgrounds for a premium, layered feel.
- **Borders & Shadows**: Borders should be subtle but visible (`border-border`). Use `shadow-sm` for depth and `shadow-md` on hover.
- **Rounding**: Prefer soft, organic corners (`rounded-xl` or `rounded-2xl`).

## 2. Professional Polish
- **Spacing (Gaps & Padding)**: Use consistent spacing tokens. Tighten vertical spacing to avoid "airy" layouts while maintaining readability.
- **Micro-interactions**: Every interaction (hover, click, transition) should feel smooth and intentional. Use `duration-300` and `ease-in-out`.
- **Consistency**: Ensure headers, buttons, and cards follow the same visual language across all pages.

## 3. Engineering Quality
- **Semantic HTML**: Use proper HTML5 elements (header, footer, main, section) for better SEO and accessibility.
- **Responsive Design**: Ensure layouts are impeccable on all screen sizes, from mobile to ultra-wide.
- **Error & Loading UX**: Never leave the user wondering. Implement beautiful loading skeletons and clear, helpful error states.
- **Code Extract**: Consolidate repetitive UI patterns into reusable local components.

## 4. Animation Principles
- **Purposeful Motion**: Animations should guide the eye, not distract. Use subtle fade-ins (`animate-in fade-in`) and slide-effects for entering content.
- **Performance**: Prioritize CSS transforms over layout-shifting properties (like height/width).
