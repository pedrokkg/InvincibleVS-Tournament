// === SORTEIO DO TEMA (50% DE CHANCE) ===
// Roda toda vez que a página carrega ou o usuário aperta F5
if (Math.random() >= 0.5) {
    document.body.classList.add('theme-omniman');
}
// =======================================

let players = [];
let bracketRounds = [];
let currentSelectedImg = '1.png';

// ==== CONFIGURAÇÃO ====
const TOTAL_DE_IMAGENS = 23; 
// ======================

window.onload = function() {
    const selector = document.getElementById('imageSelector');
    selector.innerHTML = ''; 

    for (let i = 1; i <= TOTAL_DE_IMAGENS; i++) {
        const img = document.createElement('img');
        img.src = `img/${i}.png`;
        img.className = 'avatar-option';
        if (i === 1) img.classList.add('selected');
        img.setAttribute('data-img', `${i}.png`);
        img.onclick = function() { selectAvatar(this); };
        selector.appendChild(img);
    }
};

function selectAvatar(imgElement) {
    document.querySelectorAll('.avatar-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    imgElement.classList.add('selected');
    currentSelectedImg = imgElement.getAttribute('data-img');
}

function addPlayer() {
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    
    if (!name) return alert('Digite o nome do herói/vilão!');

    players.push({
        id: Date.now(),
        name: name.toUpperCase(),
        img: `img/${currentSelectedImg}`
    });

    nameInput.value = '';
    renderPlayerList();
}

function removePlayer(idToRemove) {
    players = players.filter(p => p.id !== idToRemove);
    renderPlayerList();
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    list.innerHTML = '';
    players.forEach(p => {
        const li = document.createElement('li');
        li.className = 'player-item';
        li.innerHTML = `
            <div class="player-info">
                <img src="${p.img}"> ${p.name}
            </div>
            <button class="btn-delete" onclick="removePlayer(${p.id})">X</button>
        `;
        list.appendChild(li);
    });
}

function startTournament() {
    if (players.length < 2) return alert('Mínimo de 2 jogadores para iniciar!');
    
    const tName = document.getElementById('tournamentName').value.trim();
    document.getElementById('displayTournamentName').innerText = tName ? tName : "TORNEIO MATA-MATA";
    
    document.getElementById('setup-section').classList.add('hidden');
    document.getElementById('bracket-section').classList.remove('hidden');
    
    generateInitialBracket();
    renderBracket();
}

function generateInitialBracket() {
    let pool = [...players];
    pool.sort(() => Math.random() - 0.5);

    let nextPower = Math.pow(2, Math.ceil(Math.log2(pool.length)));
    let totalRounds = Math.log2(nextPower);

    bracketRounds = [];
    
    for (let i = 0; i < totalRounds; i++) {
        let matchesCount = nextPower / Math.pow(2, i + 1);
        let roundMatches = [];
        for (let j = 0; j < matchesCount; j++) {
            roundMatches.push({ p1: null, p2: null, winner: null });
        }
        bracketRounds.push(roundMatches);
    }

    let firstRoundMatches = bracketRounds[0];
    
    for (let i = 0; i < firstRoundMatches.length; i++) {
        if (pool.length > 0) firstRoundMatches[i].p1 = pool.pop();
    }
    
    for (let i = 0; i < firstRoundMatches.length; i++) {
        if (pool.length > 0) firstRoundMatches[i].p2 = pool.pop();
    }

    for (let i = 0; i < firstRoundMatches.length; i++) {
        let p1 = firstRoundMatches[i].p1;
        let p2 = firstRoundMatches[i].p2;

        if (p1 && !p2) advancePlayer(0, i, p1);
        else if (!p1 && p2) advancePlayer(0, i, p2);
    }
}

function advancePlayer(rIdx, mIdx, player) {
    bracketRounds[rIdx][mIdx].winner = player;
    let nextR = rIdx + 1;
    let nextM = Math.floor(mIdx / 2);

    if (bracketRounds[nextR] && bracketRounds[nextR].length > 0) {
        if (mIdx % 2 === 0) bracketRounds[nextR][nextM].p1 = player;
        else bracketRounds[nextR][nextM].p2 = player;
    }
}

function renderBracket() {
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';

    bracketRounds.forEach((round, rIdx) => {
        if (round.length === 0) return;

        const roundDiv = document.createElement('div');
        roundDiv.className = 'round';
        
        round.forEach((match, mIdx) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';

            matchDiv.appendChild(createPartNode(match.p1, match.winner, () => advancePlayer(rIdx, mIdx, match.p1)));
            matchDiv.appendChild(createPartNode(match.p2, match.winner, () => advancePlayer(rIdx, mIdx, match.p2)));
            
            roundDiv.appendChild(matchDiv);
        });
        container.appendChild(roundDiv);
    });

    const lastRound = bracketRounds[bracketRounds.length - 1];
    
    if (lastRound && lastRound[0] && lastRound[0].winner) {
        const champRoundDiv = document.createElement('div');
        champRoundDiv.className = 'round';
        const champMatchDiv = document.createElement('div');
        champMatchDiv.className = 'match';
        const winner = lastRound[0].winner;
        
        champMatchDiv.innerHTML = `
            <div class="participant winner" style="flex-direction: column; padding: 20px; text-align: center; border-bottom: none; cursor: default;">
                <span style="font-size: 1.2rem; margin-bottom: 10px;">🏆 CAMPEÃO 🏆</span>
                <img src="${winner.img}" style="width: 70px; height: 70px; margin: 0 0 10px 0;">
                <span style="font-size: 1.5rem; text-shadow: 2px 2px 0px var(--box-border); color: var(--accent-text);">${winner.name}</span>
            </div>
        `;
        champRoundDiv.appendChild(champMatchDiv);
        container.appendChild(champRoundDiv);
    }
}

function createPartNode(player, winner, onClick) {
    const div = document.createElement('div');
    div.className = 'participant';
    if (!player) {
        div.classList.add('empty');
        div.innerText = 'BYE / VAZIO';
    } else {
        if (winner && winner.id === player.id) div.classList.add('winner');
        div.innerHTML = `<img src="${player.img}"> <span>${player.name}</span>`;
        div.onclick = () => { onClick(); renderBracket(); };
    }
    return div;
}

// Substitua a função final do seu código por esta:

async function downloadImageMobileSafe() {
    const element = document.getElementById('exportArea'); 
    const btnShare = document.querySelector('.btn-share');
    
    // Pega o nome do torneio que o usuário digitou
    const inputName = document.getElementById('tournamentName').value.trim();
    // Monta o nome do arquivo. Se não tiver nome, usa "Torneio" como padrão
    const fileName = inputName ? `${inputName} chaveamento.png` : "Torneio chaveamento.png";
    
    const originalText = btnShare.innerText;
    btnShare.innerText = "GERANDO IMAGEM...";
    
    // Configura a data e hora
    const now = new Date();
    const dateTimeString = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR');
    document.getElementById('exportDateTime').innerText = "Gerado em: " + dateTimeString;
    
    // Truque das bolinhas de fundo 
    const currentBgColor = getComputedStyle(document.body).getPropertyValue('--bg-body').trim();
    const currentDotColor = getComputedStyle(document.body).getPropertyValue('--bg-dots').trim();
    const safeDotColor = currentDotColor.replace('#', '%23');
    const svgPattern = `url("data:image/svg+xml,%3Csvg width='25' height='25' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12.5' cy='12.5' r='1.5' fill='${safeDotColor}'/%3E%3C/svg%3E")`;
    
    const originalBgImage = element.style.backgroundImage;
    element.style.backgroundImage = svgPattern;
    
    try {
        const canvas = await html2canvas(element, { 
            backgroundColor: currentBgColor, 
            scale: 2,
            useCORS: true 
        });
        
        // Retorna o fundo ao normal imediatamente após a foto
        element.style.backgroundImage = originalBgImage;

        canvas.toBlob(async function(blob) {
            // O arquivo agora usa a variável 'fileName' dinâmica!
            const file = new File([blob], fileName, { type: "image/png" });
            
            // Verifica se o dispositivo (iPhone/Android) suporta compartilhar arquivos
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        title: inputName ? inputName : 'Torneio Invincible VS', // Título dinâmico no compartilhamento nativo
                        files: [file]
                    });
                } catch (shareError) {
                    console.log("Usuário cancelou o compartilhamento.");
                }
            } else {
                // FALLBACK: Para o PC, também aplicamos o nome dinâmico no download
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            btnShare.innerText = originalText;
        }, 'image/png');
        
    } catch (e) { 
        console.error("Erro do html2canvas:", e);
        alert("❌ Erro ao processar a imagem.");
        element.style.backgroundImage = originalBgImage;
        btnShare.innerText = originalText;
    }
}