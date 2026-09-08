# Sound Files for OVERCLOCKED Rapid Fire

Place your custom sound effect files directly in this directory:

- `correct.mp3` : Played when a team answers correctly (fanfare, chime, or ding)
- `wrong.mp3`   : Played when an answer is wrong or when team timer expires (buzzer or thud)
- `tick.mp3`    : (Optional) Played during the final 3 seconds of the per-team countdown

### Automatic Fallback:
If any of these `.mp3` files are missing or cannot be loaded, the app has a built-in **Web Audio API synthesizer** that dynamically generates high-fidelity game-show chimes, buzzers, and tension ticks directly in the browser!
When you drop in your real `.mp3` files, the app will automatically play your custom files.
