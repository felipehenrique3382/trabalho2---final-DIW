const ENDPOINT_AVALIACOES = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/avaliacoes";
const ENDPOINT_PONTOS = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/pontos_turisticos";

const nomePontoEl = document.getElementById("nome-ponto");
const imgPontoEl = document.getElementById("img-ponto");
const chatContainer = document.getElementById("chat-container");
const btnEnviar = document.getElementById("btnEnviar");
const comentarioEl = document.getElementById("comentario");
const estrelasEl = document.getElementById("estrelas");

const params = new URLSearchParams(window.location.search);
const pontoId = params.get("id");

let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
let avaliacaoSelecionada = 5;

// Carregar dados do ponto
async function carregarPonto() {
  if (!pontoId) return alert("ID do ponto não fornecido!");

  try {
    const res = await fetch(`${ENDPOINT_PONTOS}/${pontoId}`);
    if (!res.ok) throw new Error("Ponto não encontrado");
    const ponto = await res.json();
    nomePontoEl.textContent = ponto.Nome;

    // Garantir que a URL da imagem seja válida
    imgPontoEl.src = ponto.img
      ? ponto.img
      : "https://via.placeholder.com/800x400";
    imgPontoEl.alt = ponto.Nome;
  } catch (err) {
    alert(err.message);
  }
}

// Carregar avaliações
async function carregarAvaliacoes() {
  chatContainer.innerHTML = "";
  const res = await fetch(`${ENDPOINT_AVALIACOES}?pontoId=${pontoId}`);
  const avaliacoes = await res.json();

  avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));

  avaliacoes.forEach((a) => {
    const div = document.createElement("div");
    div.className =
      "mb-2 comentario " + (a.usuarioId === "1" ? "comentario-admin" : "");
    div.innerHTML = `
      <strong>${a.usuarioNome}</strong> <small class="text-muted">${new Date(
      a.data,
    ).toLocaleString()}</small>
      <div>⭐ ${a.estrelas}</div>
      <div>${a.comentario}</div>
    `;
    chatContainer.appendChild(div);
  });
}

// Atualizar visual das estrelas
function atualizarEstrelasVisual() {
  const todasEstrelas = estrelasEl.querySelectorAll(".estrelas");
  todasEstrelas.forEach((star) => {
    if (parseInt(star.dataset.value) <= avaliacaoSelecionada) {
      star.classList.add("checked");
      star.classList.replace("bi-star", "bi-star-fill");
    } else {
      star.classList.remove("checked");
      star.classList.replace("bi-star-fill", "bi-star");
    }
  });
}

// Evento de clique nas estrelas
estrelasEl.querySelectorAll(".estrelas").forEach((star) => {
  star.addEventListener("click", () => {
    avaliacaoSelecionada = parseInt(star.dataset.value);
    atualizarEstrelasVisual();
  });
});

// Enviar avaliação
btnEnviar.addEventListener("click", async () => {
  if (!usuarioLogado)
    return alert("Você precisa estar logado para enviar avaliações.");
  const comentario = comentarioEl.value.trim();
  if (!comentario) return alert("Digite um comentário!");

  const novaAvaliacao = {
    pontoId,
    usuarioId: usuarioLogado.id,
    usuarioNome: usuarioLogado.nome,
    estrelas: avaliacaoSelecionada,
    comentario,
    data: new Date().toISOString(),
  };

  await fetch(ENDPOINT_AVALIACOES, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(novaAvaliacao),
  });

  comentarioEl.value = "";
  avaliacaoSelecionada = 5;
  atualizarEstrelasVisual();
  carregarAvaliacoes();
});

const btnVoltarDetalhes = document.getElementById("btnVoltarDetalhes");
btnVoltarDetalhes.addEventListener("click", () => {
  if (pontoId) {
    window.location.href = `homeDetalhe.html?id=${pontoId}`;
  } else {
    window.location.href = "home.html"; // fallback
  }
});

// Inicialização
carregarPonto();
carregarAvaliacoes();
atualizarEstrelasVisual();
