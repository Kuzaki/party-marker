# party-marker

## REQUIRES pinkipi's command. Get it > https://github.com/pinkipi/command

Marks party member or self. Markers are reapplied after being ressed (no matter who dies).

## Commands
* /proxy mark arg (Requires Lead, Everyone will see).
- arg for mark accepts | All
              | Tank
               | DPS
               | Heal
               | Tank+Heal or heal+tank
               | off 
* mark all = marks everyone, so on so on...
* mark off = removes all marks

* /proxy selfmark arg (Does not require lead, Only You will see).
* arg for selfmark accepts | on | off



- COLORS

Server:
Heal = Blue
DPS = Yellow
Tank = Red

Client:
Self = blue


You can edit the color in index.js.
* heal_color
* dps_color
* tank_color
* self_color
- Only supports marker colors 

