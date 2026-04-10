# 🌴 Tiki Topple — Totem Pole Edition

> **A premium digital implementation of the Tiki Topple board game — built for the NPC Board2Code Hackathon LPU 2026.**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 📖 Table of Contents

- [About the Game](#-about-the-game)
- [How to Run](#-how-to-run)
- [Game Rules](#-game-rules)
- [Features](#-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Structure](#-project-structure)
- [Design Decisions & Simplifications](#-design-decisions--simplifications)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## 🎮 About the Game

**Tiki Topple** is a turn-based strategic stacking game where 2–4 players compete to manipulate a vertical totem pole of 9 colorful tiki tokens. Each player secretly owns specific tokens and must use tactical actions to push their tokens toward the top of the totem while disrupting their opponents.

The game ends when only 3 tikis remain on the totem or after 7 complete rounds. The player whose secret tokens hold the highest positions wins!

---

## 🚀 How to Run

**No installation, no dependencies, no build step required.**

1. Clone or download this repository
2. Open `final ticki toppel/tikki toppel/index.html` in any modern browser
3. Play!

```bash
# Clone the repo
git clone https://github.com/your-username/tiki-topple-pro-final-edition.git

# Open in browser (Windows)
start "final ticki toppel/tikki toppel/index.html"

# Open in browser (Mac/Linux)
open "final ticki toppel/tikki toppel/index.html"
```

> **Supported Browsers**: Chrome 90+, Firefox 88+, Edge 90+, Safari 15+

---

## 📜 Game Rules

### Setup
- **9 tiki tokens** (Volca 🌋, Aqua 💧, Flora 🌿, Sol ☀️, Void 🔮, Coral 🪸, Lagoon 🌊, Terra ⛰️, Lumina ✨) are randomly stacked on a vertical totem pole.
- Each player receives **secret tokens** — their goal is to get these tokens ranked as high as possible.
- Token distribution: `floor(9 / number_of_players)` tokens per player.

### Turn Actions (Choose ONE per turn)

| Action | Description |
|---|---|
| **⬆️ Tiki Up (1/2/3)** | Select any tiki and move it UP by 1, 2, or 3 positions on the totem. |
| **⬇️ Tiki Topple** | Select any tiki and send it crashing down to the BOTTOM of the totem. |
| **🔥 Tiki Toast** | Eliminate the bottom-most tiki from the game entirely. *(Cannot be the first action of the game. Cannot be used when only 3 tikis remain.)* |

### Scoring
When the game ends, the top 3 positions on the totem score points:

| Position | Points |
|---|---|
| 🥇 1st (Top) | 9 pts |
| 🥈 2nd | 7 pts |
| 🥉 3rd | 5 pts |
| 4th–9th | 0 pts |

**Your score** = sum of the points earned by all your secret tokens. **Highest total wins!**

### Game End Conditions
- Only **3 tikis remain** on the totem (via Tiki Toast eliminations), OR
- **7 complete rounds** have been played

---

## ✨ Features

### Core Gameplay
- ✅ **Turn-based multiplayer** (2–4 players, local/pass-and-play)
- ✅ **Three distinct actions**: Tiki Up, Tiki Topple, Tiki Toast
- ✅ **Secret token assignments** — each player's tokens are hidden from others
- ✅ **One action per turn** enforcement
- ✅ **Real-time scoring** with rank-based points
- ✅ **Full game loop**: Setup → Play → Game Over → Restart

### Premium UI/UX
- 🎨 **Interactive parallax landing page** with animated totems, clouds, torches, parrot, river, and foliage
- 🔮 **Glassmorphism design** with dark jungle theme
- 🎭 **9 unique tiki face designs** with custom CSS art (brows, eyes, mouths)
- ✨ **Micro-animations** throughout: token glow, selection pulse, jump effects, confetti
- 📱 **Fully responsive** — works on desktop, tablet, and mobile
- 🔤 **Modern typography** — Outfit font from Google Fonts

### Audio System
- 🎵 **Procedural jungle soundscape** — no audio files needed, generated in real-time via Web Audio API:
  - Ambient wind/hiss with modulated filter
  - Randomized bird chirps with frequency sweeps
  - Cricket/insect sounds with AM modulation
  - Flowing water with bubble effects
- 🥁 **Interactive sound effects**: Drum hit on button clicks, parrot squawk on parrot click
- 🔊 Toggle on/off with the audio button

### Player Experience
- 🔒 **Non-blocking turn transitions** — small side notification with 5-second countdown (skippable)
- 👀 **Secret token protection** — tokens blur during device handoff
- 📜 **Action log** — tracks all moves for transparency
- 📊 **Live scoreboard** — updates after every action
- 🏆 **Game over screen** with final rankings, token ownership, and confetti celebration

---

## 🛠️ Tech Stack & Architecture

### Technology
| Layer | Technology |
|---|---|
| **Structure** | HTML5 (semantic markup) |
| **Styling** | Vanilla CSS3 (no frameworks) |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **Audio** | Web Audio API (procedural generation) |
| **Fonts** | Google Fonts (Outfit) |
| **Assets** | 5 PNG images for landing page decoration |

### Architecture
```
┌─────────────────────────────────────────────────┐
│                   index.html                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  Home    │ │  Setup   │ │    Main Game     │ │
│  │  Screen  │→│  Screen  │→│  ┌────┬────┬───┐ │ │
│  │(Parallax)│ │(Players) │ │  │Left│Ctr │Rgt│ │ │
│  └──────────┘ └──────────┘ │  │Info│Pole│Act│ │ │
│                             │  └────┴────┴───┘ │ │
│  ┌──────────┐ ┌──────────┐ └──────────────────┘ │
│  │ How-To   │ │Game Over │                       │
│  │  Modal   │ │  Modal   │                       │
│  └──────────┘ └──────────┘                       │
├─────────────────────────────────────────────────┤
│                  script.js                       │
│  • Home screen systems (parallax, river, particles) │
│  • Audio engine (procedural jungle sounds)       │
│  • Game state management                         │
│  • Totem rendering & interaction                 │
│  • Action handlers (up, topple, toast)           │
│  • Turn management & scoring                     │
│  • Confetti & toast notifications                │
├─────────────────────────────────────────────────┤
│                  styles.css                      │
│  • CSS variables design system                   │
│  • Glass-morphism panels                         │
│  • Tiki token faces (pure CSS art)               │
│  • 9 color themes + animations                   │
│  • Responsive breakpoints (1100px, 700px)        │
└─────────────────────────────────────────────────┘
```

### Key Design Patterns
- **Single source of truth** — `totemStack[]` array (index 0 = top) drives all rendering
- **Action → Render → Score** pipeline — every action triggers re-render and score recalculation
- **Selection mode** — UI enters a "pick a tiki" mode for Tiki Up and Topple actions
- **CSS-only tiki faces** — no images for game tokens, all rendered with CSS shapes

---

## 📁 Project Structure

```
tiki-topple-pro-final-edition/
├── README.md                          # This file
└── final ticki toppel/
    └── tikki toppel/
        ├── index.html                 # Main HTML (342 lines)
        ├── script.js                  # Game logic + audio (1200+ lines)
        ├── styles.css                 # Full styling (1300+ lines)
        ├── NPC Board2Code Hackathon LPU 2026.pdf
        └── assets/
            ├── parrot.png             # Clickable parrot (landing page)
            ├── stone-tiki-face.png    # Center tiki decoration
            ├── tiki-torch.png         # Animated torches
            ├── tropical-leaves.png    # Foliage frame
            └── wooden-totem.png       # Side totems
```

---

## 📝 Design Decisions & Simplifications

### Documented Simplifications

1. **Vertical Totem Pole** — Instead of a horizontal track, we use a vertical totem pole where position 1 (top) is the best rank. This is closer to the original board game's visual identity.

2. **Any-Token Selection** — Players can select any tiki on the totem for Tiki Up and Tiki Topple actions, not just the top tokens. This was a deliberate design choice to increase strategic depth and reduce frustration.

3. **Tiki Toast Replaces Reorder** — Instead of a "reorder top 2–3 tokens" action, we implemented the **Tiki Toast** elimination mechanic (remove the bottom tiki). This is the signature mechanic of the original Tiki Topple board game and adds more strategic tension.

4. **Simplified Scoring** — Only the top 3 positions score points (9, 7, 5). Positions 4–9 receive 0 points. This creates higher stakes and more dramatic finishes.

5. **Single-Round Game** — Each game session is a single round. The "Play Again" button starts a fresh game. Multi-round score accumulation is not implemented.

6. **No AI Opponent** — The game is designed for local multiplayer only (pass-and-play). AI opponents are not implemented.

### Core Rules Preserved
- ✅ Turn-based gameplay
- ✅ All tokens start in a single randomized stack
- ✅ One action per turn
- ✅ Secret token ownership
- ✅ Rank-based scoring
- ✅ Clear end conditions
- ✅ Full playable game loop

---

## 🖼️ Screenshots

### Landing Page
*Interactive parallax scene with animated totems, floating clouds, river, fireflies, and procedural jungle audio.*

### Game Board
*Three-panel layout: Player info + secrets (left), Totem pole with rank labels (center), Action buttons (right).*

### Game Over
*Final rankings with token ownership, scores, and confetti celebration.*

---

## 👥 Team

**NPC Board2Code Hackathon — LPU 2026**

---

## 📄 License

This project was created for the NPC Board2Code Hackathon LPU 2026.

---

*Built with ❤️ and vanilla web technologies. No frameworks were harmed in the making of this game.*
