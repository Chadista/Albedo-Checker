# 🌐 Albedo Brightness Checker

A browser-based tool for game and technical artists to validate **albedo brightness** for PBR compliance.

## 🎯 Features

| Feature | Description |
|--------|-------------|
| **Image Upload** | Drag or choose a texture image for analysis |
| **Live Sampling** | Hover to sample brightness from a selected area |
| **Average sRGB** | Real-time display of R, G, B values |
| **Albedo Brightness** | Perceptual brightness using Rec. 709 |
| **Material Suggestions** | Contextual hints based on brightness range |
| **PBR Compliance** | Check if values are within the recommended 0.03–0.8 |
| **Out-of-Range Overlay** | Checker pattern on non-compliant pixels |
| **Zoom & Pan** | Mouse scroll + drag navigation |

## 🎨 Dark Theme

Optimized for long hours of material work. Uses deep gray background with soft contrast text and minimal UI clutter.

## 🧠 Why It Matters

Albedo impacts both perceived light interaction and bounce lighting in baked scenarios. Using incorrect values leads to unrealistic lighting, especially in engines like Unreal or Unity.

## 🛠️ Hosting

Ready for **GitHub Pages**:

1. Commit all files to your repo.
2. Enable Pages in GitHub settings → root directory → `/ (root)`.

## 📘 License

MIT License. Use and modify freely.
