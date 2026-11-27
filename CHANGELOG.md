# Changelog

## [1.1.0] - 2026-11-27
### Added
- **4 Avengers Fighters:** Thor, Captain America, Iron Man, and Hulk (bringing the roster to **12 balanced `100 HP` characters**, each with 1 Passive + 3 Lore-Accurate Skills + custom Canvas portraits).
- **Built-in 1080p Full HD Video Recorder (`1080×1920 @ 60 FPS`, `12 Mbps`):** Toggle `Auto-Rec 1080p` to automatically record from Start through the K.O. results screen and auto-download the video with SFX audio.
- **Hide UI / Show UI buttons:** Dedicated `Hide UI` button inside Creator Panel and a floating `Show UI` button at the exact top-right spot where the panel hides.

### Fixed
- **Audio drop-out during recording:** Added a persistent `masterBus` + inaudible keep-alive oscillator into `MediaStreamAudioDestinationNode` and locked `128 kbps` audio bitrate so Chromium `MediaRecorder` never drops audio mid-match.
- **Infinite reflect safeguard:** Prevented Captain America's Vibranium Shield reflect from triggering recursively in mirror matches.

## [1.0.0] - 2026-11-27
### Added
- Initial open-source release with 8 characters (Gojo, Sukuna, Naruto, Luffy, Eren, Levi, Doraemon, Frieren), `100 HP` 50–60s pacing, searchable character pickers, `Random Match`, under-HUD skill callouts, pill HP badges on orbs, and automated validation CI.
