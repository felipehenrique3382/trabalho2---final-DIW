const PEXELS_API_KEY = "4NYMPMJCpaS2MX0EfzbiJwSaDtwpyRumZiS5p1AEDmWUwh8jBV6UrLbm";
const query = "turismo,viagem,cidade,destino,pontos turísticos";
const URL = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=10`;

let imagens = [];
let indice = 0;

// Cria elementos para fade
const fade1 = document.createElement('div');
const fade2 = document.createElement('div');

[fade1, fade2].forEach(f => {
    f.style.position = 'fixed';
    f.style.top = 0;
    f.style.left = 0;
    f.style.width = '100%';
    f.style.height = '100%';
    f.style.backgroundSize = 'cover';
    f.style.backgroundPosition = 'center';
    f.style.transition = 'opacity 1.5s ease-in-out';
    f.style.zIndex = '-1';
    document.body.appendChild(f);
});

let visible = fade1;

// Busca imagens na API Pexels
async function buscarImagens() {
    try {
        const res = await fetch(URL, {
            headers: { Authorization: PEXELS_API_KEY }
        });
        const data = await res.json();
        imagens = data.photos.map(p => p.src.landscape);
        iniciarBackground();
    } catch (err) {
        console.error("Erro ao buscar imagens Pexels:", err);
    }
}

function iniciarBackground() {
    if (imagens.length === 0) return;

    // Inicializa primeiro fundo
    fade1.style.backgroundImage = `url('${imagens[0]}')`;
    fade1.style.opacity = 1;
    indice = 1;

    setInterval(() => {
        const proximo = imagens[indice];
        const oculto = visible === fade1 ? fade2 : fade1;

        oculto.style.backgroundImage = `url('${proximo}')`;
        oculto.style.opacity = 1;

        visible.style.opacity = 0;
        visible = oculto;

        indice = (indice + 1) % imagens.length;
    }, 10000); // troca a cada 10 segundos
}


buscarImagens();
