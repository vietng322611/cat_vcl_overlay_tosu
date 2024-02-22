# [VCL Tournament Overlay](https://github.com/vncommunityleague/vcl-tournament-overlay) (modified for use in CAT)

## Setup guide:
- Download [gosumemory](https://github.com/l3lackShark/gosumemory/releases/latest)
- Download this repo as .zip and extract to `static` folder inside gosumemory's folder
- FOR PLAYER/TEAM AVATAR: Put <name>.png inside static/ava. Other extension can work but you will need to edit in index.js

## Styling
- Most colors can be found in `css\style.css`
- For P1/P2 score, change hex code in `index.js` (Line `253` for P1 and line `266` for P2)

## Overlay interaction (in OBS)
- Add a browser source in OBS:
	- size: `2420x1080`
 	- URL: `127.0.0.1:24050/cat_vcl_overlay` 
- Below the preview, you should see an `Interact` button. Click on that to interact with the overlay.
- Picks: Left click for P1, right click for P2
- Bans: Shift + Left click for P1, Shift + Right click for P2
- Reset map status: Ctrl + Click

***Note:** Same as Lazer, bans must be done manually. You will also have to select who will have first pick.*

## Known bug
- Mappool is not changed after updating `mappool.json`. This can be fixed by:
	- Updating `mappool.json` **BEFORE** starting Gosumemory
	- Delete cache. This is usually located in `%APPDATA%\obs-studio\plugin_config\obs-browser` (delete the whole folder). After doing so, refresh browser source.

## Additional notes
- To trigger the auto-switching between gameplay and mappool, **the score announce message must contain `Next Pick: ...` phrase (case sensitive).** Of course with some code digging you can find where to change this.

## Special thanks
- [[Boy]DaLat](https://osu.ppy.sh/users/8266808) - @fukutotojido
- [Hoaq](https://osu.ppy.sh/users/7696512) - @itsmehoaq