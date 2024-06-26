// const queryString = window.location.search;
// const urlParams = new URLSearchParams(queryString);

let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/websocket/v2");
let mapid = document.getElementById("mapid");
let axios = window.axios;
let user = {};

// NOW PLAYING
let nowPlayingContainer = document.getElementById("nowPlayingContainer");
let stats = document.getElementById("mapStat");

// TEAM OVERALL SCORE
let teamLeftName = document.getElementById("teamLeftName");
let teamRightName = document.getElementById("teamRightName");

// TEAM PLAYING SCORE
let playingScoreContainer = document.getElementById("playingScoreContainer");
let playScoreLeft = document.getElementById("playScoreLeft");
let playScoreRight = document.getElementById("playScoreRight");
let deltaBarL = document.getElementById("deltaBarL");
let deltaBarR = document.getElementById("deltaBarR");

// Chats
let chats = document.getElementById("chats");

// Avatar
let avaLeft = document.getElementById("avatarLeft");
let avaRight = document.getElementById("avatarRight");
let avaSet = 0;

// State Toggler
let toGameplay = document.getElementById("toGameplay");
let toPool = document.getElementById("toPool");
let refresh = document.getElementById("refreshiFrame");
let overlayState = 0; // 0 = Gameplay, 1 = BanPick
let tempOverlayState = 0;

// Main
let main = document.getElementById("main");

socket.onopen = () => {
    console.log("Successfully Connected");
};

let animation = {
    playScoreLeft: new CountUp("playScoreLeft", 0, 0, 0, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: " ",
        decimal: ".",
    }),
    playScoreRight: new CountUp("playScoreRight", 0, 0, 0, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: " ",
        decimal: ".",
    }),
    accLeft: new CountUp("playScoreLeft", 0, 0, 2, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: " ",
        decimal: ".",
        suffix: "%",
    }),
    accRight: new CountUp("playScoreRight", 0, 0, 2, 0.2, {
        useEasing: true,
        useGrouping: true,
        separator: " ",
        decimal: ".",
        suffix: "%",
    }),
};

socket.onclose = (event) => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};

socket.onerror = (error) => {
    console.log("Socket Error: ", error);
};

let bestOfTemp;
let scoreVisibleTemp;
let starsVisibleTemp;

let tempMapID, tempImg, tempMapArtist, tempMapTitle, tempMapDiff, tempMapper;
let tempSR, tempCS, tempAR, tempOD, tempHP, tempLength, tempBPM;

let scoreLeftTemp, scoreRightTemp;

let playScoreLeftTemp, playScoreRightTemp, leftOffset, rightOffset, deltaScore;

let teamNameLeftTemp, teamNameRightTemp, team1, team2;

let gameState;

let chatLen = 0;
let tempClass = "unknown";

let scoreLeft = [];
let scoreRight = [];

let mappoolSetup = 0;

let tournamentDebugger = 0;
let tempTournamentDebugger;

let teamSize;
let maximumDelta;

let leftScoreWidth, rightScoreWidth;

let integratedMappool = 0;
let tempIntegratedMappool;

toMins = (time) => {
    let minutes = time.getUTCMinutes() >= 10 ? time.getUTCMinutes() : "0" + time.getUTCMinutes();
    let seconds = time.getUTCSeconds() >= 10 ? time.getUTCSeconds() : "0" + time.getUTCSeconds();
    return minutes + ":" + seconds;
};

socket.onmessage = (event) => {
    let data = JSON.parse(event.data);
    setTimeout(() => {
        if (!mappoolSetup) {
            mappoolSetup = 1;
            iFrameInitiate();
        }
    }, 1000);

    if (
        scoreVisibleTemp !== data.tourney.scoreVisible ||
        tempOverlayState !== overlayState ||
        tempTournamentDebugger !== tournamentDebugger
    ) {
        tempTournamentDebugger = tournamentDebugger;
        if (tournamentDebugger === 0) scoreVisibleTemp = data.tourney.scoreVisible;
        else scoreVisibleTemp = true;
        tempOverlayState = overlayState;
        if (scoreVisibleTemp === true) {
            // Score visible -> Set bg bottom to full
            chats.style.width = "0px";
            playingScoreContainer.style.opacity = 1;
            deltaBarL.style.opacity = 1;
            deltaBarR.style.opacity = 1;
            nowPlayingContainer.className = "nowPlayingInMatch";
        } else if (scoreVisibleTemp === false) {
            // Score invisible -> Set bg to show chats
            if (tempOverlayState === 0) {
                chats.style.width = "930px";
                chats.style.transform = `none`;
                playingScoreContainer.style.opacity = 0;
                deltaBarL.style.opacity = 0;
                deltaBarR.style.opacity = 0;
                nowPlayingContainer.className = "nowPlayingWaiting";
                stats.className = "shown";
                // main.style.backgroundImage = "var(--bg2)";
            } else if (tempOverlayState === 1) {
                chats.style.transform = `translateX(${(1920 - 930) / 2}px)`;
                nowPlayingContainer.className = "nowPlayingWaiting hidden";
                stats.className = "hidden";
                // main.style.backgroundImage = "var(--mp-bg2)";
            }
        }
    }

    if (starsVisibleTemp !== data.tourney.tarsVisible) {
        starsVisibleTemp = data.tourney.tarsVisible;
        if (starsVisibleTemp) {
            document.getElementById("scoreContainerLeft").style.opacity = "1";
            document.getElementById("scoreContainerRight").style.opacity = "1";
        } else {
            document.getElementById("scoreContainerLeft").style.opacity = "0";
            document.getElementById("scoreContainerRight").style.opacity = "0";
        }
    }

    if (tempMapID !== data.beatmap.id) {
        let tempImgPath = data.folders.beatmap + '/' + data.files.background;
        nowPlayingContainer.style.backgroundImage = `url('http://127.0.0.1:24050/Songs/${tempImgPath.replace(/ /g, "%20")}')`;
    }

    if (tempMapID !== data.beatmap.id || tempSR !== data.beatmap.stats.stars.total || tempLength !== data.beatmap.time.lastObject) {
        tempMapID = data.beatmap.id;
        tempMapArtist = data.beatmap.artist;
        tempMapTitle = data.beatmap.title;
        tempMapDiff = data.beatmap.version;
        tempMapper = data.beatmap.mapper;

        tempCS = data.beatmap.stats.cs.converted;
        tempAR = data.beatmap.stats.ar.converted;
        tempOD = data.beatmap.stats.od.converted;
        tempHP = data.beatmap.stats.hp.converted;
        tempSR = data.beatmap.stats.stars.total;
        tempLength = data.beatmap.time.lastObject;
        let convertedLength = new Date(tempLength);
        convertedLength = toMins(convertedLength);

        tempBPM = data.beatmap.stats.bpm.max;
        if (data.beatmap.stats.bpm.max !== data.beatmap.stats.bpm.min) tempBPM = `${data.beatmap.stats.bpm.min} - ${data.beatmap.stats.bpm.max}`;

        mapName.innerHTML = tempMapArtist + " - " + tempMapTitle;
        mapDifficulty.innerHTML = `Difficulty: <span style="font-weight: 700">${tempMapDiff}</span>`;
        mapCreator.innerHTML = `Mapper: <span style="font-weight: 700">${tempMapper}</span>`;
        mapIndex.innerHTML = `CS: <span style="font-weight: 700">${tempCS}</span> / AR: <span style="font-weight: 700">${tempAR}</span> / OD: <span style="font-weight: 700">${tempOD}</span> / HP: <span style="font-weight: 700">${tempHP}</span></br>Star Rating: <span style="font-weight: 700">${tempSR}*</span>`;
        mapTime.innerHTML = `Length: <span style="font-weight: 700">${convertedLength}</span></br>BPM: <span style="font-weight: 700">${tempBPM}</span>`;

        setTimeout(() => {
            togglePool(false);
        }, 7270);
    }
    if (bestOfTemp !== data.tourney.bestOF) {
        bestOfTemp = data.tourney.bestOF;
        containerLeft = document.getElementById("scoreContainerLeft");
        containerRight = document.getElementById("scoreContainerRight");
        containerLeft.innerHTML = "";
        containerRight.innerHTML = "";
        for (var counter = 0; counter < Math.ceil(bestOfTemp / 2); counter++) {
            scoreLeft[counter] = document.createElement("div");
            scoreLeft[counter].id = `scoreLeft${counter}`;
            scoreLeft[counter].setAttribute("class", "scoreLeft");
            containerLeft.appendChild(scoreLeft[counter]);

            scoreRight[counter] = document.createElement("div");
            scoreRight[counter].id = `scoreRight${counter}`;
            scoreRight[counter].setAttribute("class", "scoreRight");
            containerRight.appendChild(scoreRight[counter]);
        }
    }
    if (scoreLeftTemp !== data.tourney.totalScore.left) {
        scoreLeftTemp = data.tourney.totalScore.left;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreLeftTemp) {
                scoreLeft[i].style.backgroundColor = "#fff";
            } else if (i >= scoreLeftTemp) {
                scoreLeft[i].style.backgroundColor = "rgba(255 255 255 / .5)";
            }
        }
    }

    if (scoreRightTemp !== data.tourney.totalScore.right) {
        scoreRightTemp = data.tourney.totalScore.right;
        for (var i = 0; i < Math.ceil(bestOfTemp / 2); i++) {
            if (i < scoreRightTemp) {
                scoreRight[Math.ceil(bestOfTemp / 2) - 1 - i].style.backgroundColor = "#fff";
            } else if (i >= scoreRightTemp) {
                scoreRight[Math.ceil(bestOfTemp / 2) - 1 - i].style.backgroundColor = "rgba(255 255 255 / .5)";
            }
        }
    }

    if (team1 !== data.tourney.clients[0].team && team2 !== data.tourney.clients[2].team) {
        if (tournamentDebugger === 0) {
            team1 = data.tourney.clients[0].team;
            team2 = data.tourney.clients[2].team;
        }
        avaSet = 0;
    }

    if (teamNameLeftTemp !== data.tourney.team.left) {
        teamNameLeftTemp = data.tourney.team.left;
        teamLeftName.innerHTML = teamNameLeftTemp;
    }
    if (teamNameRightTemp !== data.tourney.team.right) {
        teamNameRightTemp = data.tourney.team.right;
        teamRightName.innerHTML = teamNameRightTemp;
    }

    if (!avaSet && tournamentDebugger === 0) {
        avaSet = 1;
        setAvatar(avaLeft, team1);
        setAvatar(avaRight, team2);
    }

    if (scoreVisibleTemp) {
        let accLeft = 0.0;
        let accRight = 0.0;

        if (tournamentDebugger === 0) {
            teamSize = 2;

            data.tourney.ipcClients.forEach((client) => {
                switch (client.team) {
                    case "left":
                        accLeft += client.play.accuracy;
                        break;
                    case "right":
                        accRight += client.play.accuracy;
                        break;
                    default:
                        return;
                }
            });

            playScoreLeftTemp = accLeft / teamSize;
            playScoreRightTemp = accRight / teamSize;
            // maximumDelta = teamSize * 1000000;
            maximumDelta = 100;
        } else {
            teamSize = 1;
            maximumDelta = 100;
        }

        deltaScore = playScoreRightTemp - playScoreLeftTemp;

        animation.accLeft.update(playScoreLeftTemp);
        animation.accRight.update(playScoreRightTemp);

        leftScoreWidth = parseInt(getComputedStyle(playScoreLeft).width);
        rightScoreWidth = parseInt(getComputedStyle(playScoreRight).width);

        leftOffset = -Math.sqrt(Math.abs((deltaScore / maximumDelta) * (960 - leftScoreWidth) * (960 - leftScoreWidth)));
        rightOffset = Math.sqrt((deltaScore / maximumDelta) * (960 - rightScoreWidth) * (960 - rightScoreWidth));

        // console.log(rightOffset);

        if (playScoreLeftTemp > playScoreRightTemp) {
            // Left is Leading
            playScoreLeft.className = "leadingScore";
            playScoreRight.className = "normalScore";
            if (-leftOffset >= leftScoreWidth / 2) {
                if (-leftOffset < 960 - leftScoreWidth) playScoreLeft.style.transform = `translateX(${leftOffset + leftScoreWidth / 2}px)`;
                else playScoreLeft.style.transform = `translateX(-${960 - leftScoreWidth}px)`;
            } else playScoreLeft.style.transform = `translateX(0)`;
            playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = `${-leftOffset}px`;
            deltaBarR.style.width = 0;
        } else if (playScoreLeftTemp === playScoreRightTemp) {
            // Tie
            playScoreLeft.className = "normalScore";
            playScoreRight.className = "normalScore";
            playScoreLeft.style.transform = `translateX(0)`;
            playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = 0;
            deltaBarR.style.width = 0;
        } else {
            // Right is Leading
            playScoreRight.className = "leadingScore";
            playScoreLeft.className = "normalScore";
            playScoreLeft.style.transform = `translateX(0)`;
            if (rightOffset >= rightScoreWidth / 2)
                if (rightOffset < 960 - rightScoreWidth) playScoreRight.style.transform = `translateX(${rightOffset - rightScoreWidth / 2}px)`;
                else playScoreRight.style.transform = `translateX(${960 - rightScoreWidth}px)`;
            else playScoreRight.style.transform = `translateX(0)`;
            deltaBarL.style.width = 0;
            deltaBarR.style.width = `${rightOffset}px`;
        }
    }

    if (data.tourney.chat)
        if (chatLen != data.tourney.chat.length) {
            // There's new chats that haven't been updated
            // console.log((data.tourney.chat).length);
            if (chatLen == 0 || (chatLen > 0 && chatLen > data.tourney.chat.length)) {
                // Starts from bottom
                chats.innerHTML = "";
                chatLen = 0;
            }

            // Add the chats
            for (var i = chatLen; i < data.tourney.chat.length; i++) {
                tempClass = data.tourney.chat[i].team;

                // Chat variables
                let chatParent = document.createElement("div");
                chatParent.setAttribute("class", "chat");

                let chatTime = document.createElement("div");
                chatTime.setAttribute("class", "chatTime");

                let chatName = document.createElement("div");
                chatName.setAttribute("class", "chatName");

                let chatText = document.createElement("div");
                chatText.setAttribute("class", "chatText");

                chatTime.innerText = data.tourney.chat[i].time;
                chatName.innerText = data.tourney.chat[i].name + ":\xa0";
                chatText.innerText = data.tourney.chat[i].messageBody;

                // if (data.tourney.chat[i].messageBody.includes("Next Pick")) togglePool(true);

                if (data.tourney.chat[i].messageBody.includes("Next Pick")) {
                    setTimeout(togglePool(true), 15000);
                }

                chatName.classList.add(tempClass);

                chatParent.append(chatTime);
                chatParent.append(chatName);
                chatParent.append(chatText);
                chats.append(chatParent);
            }

            // Update the Length of chat
            chatLen = data.tourney.chat.length;

            // Update the scroll so it's sticks at the bottom by default
            chats.scrollTop = chats.scrollHeight;
        }
};

async function iFrameInitiate() {
    let mappoolPicker = document.createElement("iframe");
    mappoolPicker.setAttribute("src", `./mappool`);
    mappoolPicker.setAttribute("frameBorder", "0");
    mappoolPicker.setAttribute("name", `picker`);
    mappoolPicker.className = "mappoolPicker";

    document.body.appendChild(mappoolPicker);
}

toGameplay.addEventListener("click", () => {
    togglePool(false);
});

toPool.addEventListener("click", () => {
    togglePool(true);
});

refresh.addEventListener("click", () => {
    [].forEach.call(document.querySelectorAll("[name*=picker]"), (ifr) => {
        ifr.contentWindow.location.reload(true);
    });
    togglePool(true);
});

async function setAvatar(element, username) {
    if (username !== null) {
        element.style.backgroundImage = `url("ava/${username}.png")`;
    } else {
        element.style.backgroundImage = `url("static/default.png")`;
    }
}

togglePool = (state) => {
    if (state) {
        overlayState = 1;

        let ifr = document.getElementsByName(`picker`)[0];
        ifr.style.opacity = 1;

        // [].forEach.call(document.querySelectorAll("[name*=picker]"), (ele) => {
        //     ele.style.clipPath = "inset(0px 0px 0px 1920px)";
        // });

        let playArea = document.getElementById("playArea");
        playArea.style.clipPath = "inset(0px 0px 0px 0px)";

        setTimeout(() => {
            ifr.style.clipPath = "inset(0px 0px 0px 0px)";
        }, 500);
    } else {
        overlayState = 0;

        let playArea = document.getElementById("playArea");
        playArea.style.clipPath = "inset(0px 0px 0px 1920px)";

        [].forEach.call(document.querySelectorAll("[name*=picker]"), (ele) => {
            ele.style.clipPath = "inset(0px 0px 0px 1920px)";
        });
    }
};
