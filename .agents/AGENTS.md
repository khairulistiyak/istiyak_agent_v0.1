# Project Custom Rules & Styling Guidelines

## UI & Icons Specification
- **Icon Rendering Policy:** Do not use custom SVG paths or shapes for file type icons (like `.ts`, `.tsx`, `.json`) or tool status symbols in React/Tauri code.
- **Built-in Icons:** Always use built-in icons from a standardized library such as `lucide-react` or `@vscode/codicons` (Codicons). This ensures icons are recognizable, standardized, and lightweight.
- **Micro-Compact Button Sizing:** Always use translucent glass-pill style buttons for primary and secondary actions matching the `07-accept-reject-zen.svg` specifications. Keep layout spacing tight and developer-native.
