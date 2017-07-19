const Command = require('command')

module.exports = function Partymarker(dispatch) {
    const command = Command(dispatch)
    
const red = 0,
    yellow = 1,
    blue = 2,
    heal_color = yellow,
    dps_color = blue,
    tank_color = red,
    self_color = blue;
    
let enabled = null,
    self_mark = null,
    glow_mark = null,
    tomark = null,
    leaderID = null,
    playerID = null,
    location = {x: 0, y: 0 , z: 0},
    self = [],
    dead = [],
    heal = [],
    dps = [],
    tank = [],
    tank_heal = [],
    all = [];
    
    command.add('mark', (arg) => {
            if(playerID != leaderID){
                command.message('(Party-Marker) Cannot Mark, Require Lead!')
                return;
            }
            if(arg === 'all'){
                enabled = true;
                tomark = all;
                command.message('(Party-Marker) Marked all');
            }
            else if(arg ===  'tank+heal' || arg ===  'heal+tank'){
                enabled = true;
                tomark = tank_heal;
                command.message('(Party-Marker) Marked Tank and Heal');
            }
            else if(arg ===  'heal'){
                enabled = true;
                tomark = heal;
                command.message('(Party-Marker) Marked Heal');
            }
            else if(arg ===  'tank'){
                enabled = true;
                tomark = tank;
                command.message('(Party-Marker) Marked Tank');
            }
            else if(arg ===  'dps'){
                enabled = true;
                tomark = dps;
                command.message('(Party-Marker) Marked DPS');
            }
            else if(arg ===  'off'){
                tomark = [];
                mark(tomark);
                enabled = false;
                command.message('(Party-Marker) Marks Removed')
            }
            enabled ? command.message('(Party-Marker) Auto Mark Enabled') : command.message('(Party-Marker) Auto Mark Disabled') 
            if(tomark.length != 0) mark(tomark);
    });
    command.add('selfmark', (arg) => {
        if(self.length == 0){
            command.message('(Party-Marker) Not in Party')
            return;
        }
        if(arg === 'on'){
                self_mark = true;
                enabled = true;
                selfmark(self);
                command.message('(Party-Marker) Self-Mark On');
        }
        if(arg === 'off'){
                self_mark = false;
                enabled = false;
                selfmark([]);
                command.message('(Party-Marker) Self-Mark Off');
        }
    });
    command.add('glowmark', (arg) => {
        if(arg === 'on') glow_mark = true;  
        if(arg === 'off') {
            glow_mark = false;
            removeMarker();
        }
    });
    
    dispatch.hook('S_LOGIN', 2, (event) => {	
		playerID = event.playerId;
    });

    dispatch.hook('S_PARTY_MEMBER_LIST', 5, event => {
        leaderID = event.leaderPlayerId;
        resetparty(); //everytime list update, reset the party first so you do not have duplicates or someone left party.
            for (let x in event.members){
                if(playerID == event.members[x].playerId) self.push({color: self_color, target: event.members[x].cid});
                if(event.members[x].class == 6 || event.members[x].class == 7) heal.push({color: heal_color, target: event.members[x].cid});
                else if(event.members[x].class == 1 || event.members[x].class == 10) tank.push({color: tank_color, target: event.members[x].cid});
                else dps.push({color: dps_color, target: event.members[x].cid});
            }
            tank_heal = heal.concat(tank);
            all = tank_heal.concat(dps);
    });
    
    dispatch.hook('S_CHANGE_PARTY_MANAGER', 1, event => {
        leaderID = event.target.high;
    });
    
    dispatch.hook('S_PARTY_MEMBER_STAT_UPDATE', 2, (event) => {
		if (!enabled) return;
        if(event.curHp == 0 && !dead.includes(event.playerId)){
            dead.push(event.playerId)
        }
        if(event.curHp > 0 && dead.includes(event.playerId)){
            let index = dead.indexOf(event.playerId);
            dead.splice(index, 1);
            self_mark ? selfmark(self) : mark(tomark);
        }
	});
    
    dispatch.hook('C_PLAYER_LOCATION', 1, (event) => {
        if(!glow_mark) return;
        location.x = event.x1;
        location.y = event.y1;
        location.z = event.z1;
        updateItemMarker();
    });
    
    dispatch.hook('C_START_SKILL', 3, {order: -10}, event => {
        if(!glow_mark) return;
        location.x = event.x;
        location.y = event.y;
        location.z = event.z;
        updateItemMarker();
	});
	dispatch.hook('S_ACTION_STAGE', 1,{order: -10}, event => {
        if(!glow_mark) return;
        if(event.source.high != playerID) return;
        location.x = event.x;
        location.y = event.y;
        location.z = event.z;
        updateItemMarker();
	});
	dispatch.hook('S_ACTION_END', 1, {order: -10},event => {
        if(!glow_mark) return;
        if(event.source.high != playerID) return;
        location.x = event.x;
        location.y = event.y;
        location.z = event.z;
        updateItemMarker();
	});
    
    function updateItemMarker(){
        removeMarker();
        spawnMarker();
    }

    function spawnMarker() {	
		dispatch.toClient('S_SPAWN_DROPITEM', 1, {
			id: playerID,
			x: location.x,
			y: location.y,
			z: location.z-250,
			item: 98260,
			amount: 1,
			expiry: 999999,
			owners: [{id: playerID}]
		});	
	}
    
    function removeMarker() {
			dispatch.toClient('S_DESPAWN_DROPITEM', 1, {
				id: playerID
			});	
    }
    
    function resetparty(){
        self = []
        heal = [],
        dps = [],
        tank = [],
        tank_heal = [],
        all = [];
    }
    
    function selfmark(id){
            dispatch.toClient('S_PARTY_MARKER', 1, {
                markers: id
            });
    }

    function mark(marks){
            dispatch.toServer('C_PARTY_MARKER', 1, {
                markers: marks
              });
    }
};
