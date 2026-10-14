# coucou-but-better

A personal fork of **[Coucou](https://github.com/Louis-CFM/coucou)** by **Louis Raillé**: bug fixes, extra Mochi skins, and small improvements for my own setup.

Coucou is a little desktop companion that keeps an eye on your AI coding agents. It shows what they are doing, brings up permission requests, and lets you jump back to their sessions. This fork builds on that idea, with most changes focused on **Windows and Linux**.

I keep the fixes and ideas I want here, and may add more as I use it.

## What's different

| Change | What it does |
|---|---|
| Outfits for each agent | Assign skins independently to the main Mochi and the smaller agents. Right-click an agent pill or use the **Agent** selector in the wardrobe. |
| Among Us and Verity | Two extra skins, adapted to Mochi's rounded shape, for both large and small characters. |
| Zed integration | Select Zed as the main IDE, follow Claude Code sessions in its terminal, and open session files in Zed (Windows/Linux). |
| Claude Code labels | Agent pills and idle cards show **Claude Code** instead of **VS Code**. |
| Compact panel | The main character keeps the selected agent's skin when the panel is folded. |
| Codex terminal focus on Linux | **Open terminal** looks for the running Codex terminal instead of falling back to VS Code. |
| X11 fixes | Fixes for stale skin layers and cursor tracking over the compact panel. |

The original session viewer, permission prompts, chat, file drop, integrations, shortcuts, and seasonal outfits are inherited from Coucou. See the [desktop guide](windows/README.md) for usage and supported agents.

## Install

Look for packaged builds in **[this fork's Releases](https://github.com/falearn228/coucou-but-better/releases)**.

- **Windows:** use the `.msi` or `-setup.exe` installer. The portable ZIP contains `coucou.exe` and `coucou-hook.exe`; unpack them into the same folder.
- **Linux:** see the [Linux setup and packaging notes](windows/README.md#linux).

Fork releases use the **`.f`** suffix. Upstream downloads and release history are available in the [original repository](https://github.com/Louis-CFM/coucou).

## Build from source

Windows and Linux builds share the code in `windows/`.

You need **Node.js 24** and **Rust**. On Windows, use the MSVC Rust toolchain and Visual Studio Build Tools with **Desktop development with C++**. On Linux, install the [system dependencies](windows/README.md#linux) first.

```sh
git clone https://github.com/falearn228/coucou-but-better.git
cd coucou-but-better/windows
npm ci
npm run pack
```

Packages are written to `windows/release/`. For development, run `npm run tauri dev` instead of `npm run pack`.

More details: [Windows build instructions](windows/README.md#build-it-yourself) · [Linux instructions](windows/README.md#linux).

## Versions

| Tag | Changes |
|---|---|
| [0.4.1.f](https://github.com/falearn228/coucou-but-better/tree/0.4.1.f) | Per-agent outfits, Among Us and Verity, Claude Code labels, compact-panel fixes, and Linux terminal/X11 fixes. |

See [CHANGELOG.md](CHANGELOG.md) for release notes, including the history inherited from upstream.

## Around the repository

| Path | Contents |
|---|---|
| [`windows/`](windows/) | Shared Windows/Linux app: Rust backend, TypeScript UI, and the hook relay. |
| [`linux/`](linux/) | Linux packaging helpers. |
| [`NotchBuddy/`](NotchBuddy/) | Original macOS and iPhone sources. |
| [`android/`](android/) | Android companion and its build guide. |
| [`docs/`](docs/) | Integration, protocol, and other project documentation. |

For the original macOS and phone features, see [upstream Coucou](https://github.com/Louis-CFM/coucou). To connect an agent, see the [desktop agent guide](windows/README.md#supported-agents) and [hook event documentation](docs/AGENTS.md).

## Ideas and contributions

This is a personal fork with room for more fixes, skins, and experiments. Bug reports, ideas, and pull requests are welcome in [this repository](https://github.com/falearn228/coucou-but-better/issues). For bugs, include your OS and steps to reproduce the problem.

## Credits and license

- **Original Coucou and Mochi:** [Louis Raillé / Louis-CFM](https://github.com/Louis-CFM/coucou) and the [upstream contributors](https://github.com/Louis-CFM/coucou/graphs/contributors).
- **Android app and phone link:** [Rhytam Biswas / Rhytam23](https://github.com/Rhytam23).
- **Fork changes:** [falearn228](https://github.com/falearn228).

The source code is covered by the [MIT License](LICENSE). The original name, Mochi character, icons, sounds, and media have separate terms in [LICENSE-ASSETS.md](LICENSE-ASSETS.md). Android code and the phone link also retain their [license and attribution](android/LICENSE).
