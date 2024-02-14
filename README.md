# VCL Tournament Overlay - Lazer edition by Try-Z (modified for use with CAT)

## Setup guide:
- Install Gosumemory (duh)
- Download this repo as .zip and extract to `static` folder of Gosumemory
- Update mappool by changing IDs in `mappool\mappool.json`.

## Styling
- TODO: Proper mod icon
- Most colors can be found in `css\style.css`
- For P1/P2 score, change hex code in `index.js` (Line `253` for P1 and line `266` for P2)

## Overlay interaction (in OBS)
- Add a browser source in OBS:
	- size: `2420x1080`
 	- URL: `127.0.0.1:24050/vcl-tournament-overlay` 
- Below the preview, you should see an `Interact` button. Click on that to interact with the overlay.
- Picks: Left click for P1, right click for P2
- Bans: Shift + Left click for P1, Shift + Right click for P2
- Reset map status: Ctrl + Click

***Note:** Same as Lazer, bans must be done manually. You will also have to select who will have first pick.*

## Known bug
- Mappool is not changed after updating `mappool.json`. This can be fixed by:
	- Updating `mappool.json` **BEFORE** starting Gosumemory
	- Delete cache. This is located in `C:\Users\{YourUsername}\AppData\Roaming\obs-studio\plugin_config\obs-browser` (delete the whole folder). After doing so, refresh browser source.

## Additional notes
- To trigger the auto-switching between gameplay and mappool, **the score announce message must contain `Next Pick: ...` phrase (case sensitive).** Of course with some code digging you can find where to change this.
- If the players' avatars are not visible, spam Refresh in OBS.

