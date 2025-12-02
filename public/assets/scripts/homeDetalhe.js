// Esdras
const ENDPOINT_API =
  "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/pontos_turisticos";

// --- CONFIGURAÇÃO DO MAPBOX ---
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXNkcmFzMDU5IiwiYSI6ImNtaWs4ZnNlMjFkNTEzZnBmdDV5Mmg4MWUifQ.kWU-Govab8zb8HsjV0k34A";

const container = document.getElementById("detalhe-container");
const loadingSpinner = document.getElementById("loading");
const errorContainer = document.getElementById("error-container");

document.addEventListener("DOMContentLoaded", () => {
  buscarDadosDoPonto();
});

async function buscarDadosDoPonto() {
  const params = new URLSearchParams(window.location.search);
  const pontoId = params.get("id");

  if (!pontoId) {
    mostrarErro("Nenhum ID foi fornecido.");
    return;
  }

  try {
    const response = await fetch(`${ENDPOINT_API}/${pontoId}`);
    if (!response.ok) throw new Error(`Ponto não encontrado`);
    const ponto = await response.json();

    renderizarDetalhes(ponto);

    if (ponto.Lat && ponto.Lng) {
      carregarMapa(ponto.Lat, ponto.Lng, ponto.Nome);
    }
  } catch (error) {
    mostrarErro(error.message);
  }
}

function renderizarDetalhes(ponto) {
  loadingSpinner.style.display = "none";

  container.innerHTML = `
            <div class="text-center mb-4">
                <h1 class="display-4 fw-bold">${ponto.Nome}</h1>
                <span class="badge bg-secondary fs-6">${ponto.Tipo}</span>
            </div>

            <img src="${
              ponto.img || "https://via.placeholder.com/1200x450"
            }" class="detalhe-img shadow" alt="${ponto.Nome}">

            <div class="row g-5">
                <div class="col-md-8">
                    <h3 class="border-bottom pb-2">Sobre</h3>
                    <p class="fs-5 text-muted">${ponto.Descrição}</p>

                    <div class="alert alert-info mt-4" role="alert">
                        <h5 class="alert-heading">💡 Dicas do Especialista:</h5>
                        <p class="mb-0">${
                          ponto.Dicas ||
                          "Nenhuma dica cadastrada para este local."
                        }</p>
                    </div>

                    <h4 class="mt-5 mb-3">📍 Localização no Mapa</h4>
                    ${
                      ponto.Lat && ponto.Lng
                        ? '<div id="mapa-mapbox"></div>'
                        : '<div class="alert alert-warning">Coordenadas não cadastradas para exibir o mapa.</div>'
                    }

                    <div class="mt-5" id="avaliacoes-container"></div>
                </div>

                <div class="col-md-4">
                    <div class="d-grid gap-2 mb-4">
                        <a href="home.html" class="btn btnColor">Voltar para a Lista</a>
                    </div>
                      <div class="d-grid gap-2 mb-4">
                        <a href="avaliacao.html?id=${
                          ponto.id
                        }" class="btn btnSecondary">Avaliar este ponto</a>
                      </div>


                    <div class="card shadow-sm">
                        <div class="card-header bg-primary text-white fw-bold">
                            Informações Rápidas
                        </div>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <strong>📅 Horários:</strong><br> ${
                                  ponto.Horario || "Não informado"
                                }
                            </li>
                            <li class="list-group-item">
                                <strong>💰 Preço:</strong><br> ${
                                  ponto.Preco || "Grátis / Não informado"
                                }
                            </li>
                            <li class="list-group-item">
                                <strong>🏙️ Cidade/UF:</strong><br> ${
                                  ponto.Cidade
                                } - ${ponto.Estado}
                            </li>
                            <li class="list-group-item">
                                <strong>📍 Endereço:</strong><br> ${
                                  ponto.Local || "Não informado"
                                }
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
}

function carregarMapa(lat, lng, titulo) {
  if (MAPBOX_TOKEN === "SEU_TOKEN_MAPBOX_AQUI") {
    console.warn("Token do Mapbox não configurado no detalhe.js");
    return;
  }

  mapboxgl.accessToken = MAPBOX_TOKEN;

  const map = new mapboxgl.Map({
    container: "mapa-mapbox",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [lng, lat],
    zoom: 14,
  });

  map.addControl(new mapboxgl.NavigationControl());

  new mapboxgl.Marker({ color: "red" })
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h5>${titulo}</h5>`))
    .addTo(map);
}

function mostrarErro(mensagem) {
  loadingSpinner.style.display = "none";
  errorContainer.innerHTML = `<div class="alert alert-danger"><strong>Erro:</strong> ${mensagem}</div>`;
}
