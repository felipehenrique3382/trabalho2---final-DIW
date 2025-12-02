const ENDPOINT_API = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/pontos_turisticos";

let todosOsPontos = [];
let pontoSendoEditado = null;

const grid = document.getElementById("grid-pontos");
const buscaInput = document.getElementById("busca");
const filtroTipoSelect = document.getElementById("filtroTipo");
const formCadastro = document.getElementById("form-cadastro");
const botaoForm = document.getElementById("btnSalvar");
const botaoCancelar = document.getElementById("btnCancelar");

// ----------- CARREGAMENTO ----------------
async function carregarDados() {
  try {
    grid.innerHTML = `<div class="col-12 text-center mt-5"><div class="spinner-border text-primary"></div><p>Carregando...</p></div>`;
    const res = await fetch(ENDPOINT_API);
    if (!res.ok) throw new Error("Erro API");
    const data = await res.json();
    todosOsPontos = (Array.isArray(data) ? data : []).map(p => ({ ...p, id: p.id }));

    popularFiltroTipos();
    renderizarPontos(todosOsPontos);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="alert alert-danger">Erro ao carregar dados.</div>`;
  }
}

// ----------- RENDERIZAÇÃO ----------------
function renderizarPontos(pontos) {
  grid.innerHTML = "";
  if (!pontos.length) {
    grid.innerHTML = '<p class="text-center text-muted">Nenhum ponto encontrado.</p>';
    return;
  }

  pontos.forEach(ponto => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-4 d-flex align-items-stretch mb-4";
    col.innerHTML = `
      <div class="card h-100 shadow-sm position-relative">
        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
          onclick="excluirPonto(event, '${ponto.id}', '${ponto.Nome}')">&times;</button>

        <a href="homeDetalhe.html?id=${ponto.id}">
          <img src="${ponto.img || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}" class="card-img-top" alt="${ponto.Nome}">
        </a>

        <div class="card-body d-flex flex-column">
          <a href="homeDetalhe.html?id=${ponto.id}" class="text-decoration-none text-dark">
            <h5 class="card-title">${ponto.Nome}</h5>
            <p class="card-subtitle mb-2 text-muted">${ponto.Cidade}, ${ponto.Estado}</p>
          </a>

          <p class="card-text text-truncate">${ponto.Descrição}</p>

          <div class="mt-auto d-flex justify-content-between">
            <span class="badge span fw-bold">${ponto.Tipo}</span>
            <button type="button" class="btn btnSecondary btn-sm fw-bold" onclick="editarPonto(event,'${ponto.id}')">Editar ✏️</button>
          </div>
        </div>
      </div>`;
    grid.appendChild(col);
  });
}

// ----------- FILTROS ----------------
function popularFiltroTipos() {
  filtroTipoSelect.innerHTML = '<option value="">Filtrar por Tipo (Todos)</option>';
  const tipos = [...new Set(todosOsPontos.map(p => p.Tipo))].sort();
  tipos.forEach(tipo => filtroTipoSelect.innerHTML += `<option value="${tipo}">${tipo}</option>`);
}

function aplicarFiltros() {
  const termo = buscaInput.value.toLowerCase();
  const tipo = filtroTipoSelect.value;
  const filtrados = todosOsPontos.filter(p => {
    const matchBusca = p.Nome?.toLowerCase().includes(termo) || p.Cidade?.toLowerCase().includes(termo);
    const matchTipo = tipo === "" || p.Tipo === tipo;
    return matchBusca && matchTipo;
  });
  renderizarPontos(filtrados);
}

// ----------- FORM ----------------
formCadastro.addEventListener("submit", async function (event) {
  event.preventDefault();
  const dadosPonto = {
    Nome: document.getElementById("nomePonto").value,
    Local: document.getElementById("localPonto").value,
    Cidade: document.getElementById("cidadePonto").value,
    Estado: document.getElementById("estadoPonto").value.toUpperCase(),
    Tipo: document.getElementById("tipoPonto").value,
    Descrição: document.getElementById("descPonto").value,
    img: document.getElementById("imgPonto").value,
    Horario: document.getElementById("horarioPonto").value,
    Preco: document.getElementById("precoPonto").value,
    Dicas: document.getElementById("dicasPonto").value,
    Lat: parseFloat(document.getElementById("latPonto").value),
    Lng: parseFloat(document.getElementById("lngPonto").value),
  };

  try {
    if (pontoSendoEditado) {
      await atualizarPontoAPI(pontoSendoEditado.id, dadosPonto);
      const idx = todosOsPontos.findIndex(p => p.id === pontoSendoEditado.id);
      if (idx !== -1) todosOsPontos[idx] = { ...dadosPonto, id: pontoSendoEditado.id };
    } else {
      const novo = await adicionarPontoAPI(dadosPonto);
      todosOsPontos.push(novo);
    }
    aplicarFiltros();
    popularFiltroTipos();
    resetarFormulario();
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
});

// ----------- EDITAR ----------------
function editarPonto(event, id) {
  event.preventDefault();
  event.stopPropagation();
  const ponto = todosOsPontos.find(p => p.id === id);
  if (!ponto) return;

  document.getElementById("nomePonto").value = ponto.Nome || "";
  document.getElementById("localPonto").value = ponto.Local || "";
  document.getElementById("cidadePonto").value = ponto.Cidade || "";
  document.getElementById("estadoPonto").value = ponto.Estado || "";
  document.getElementById("tipoPonto").value = ponto.Tipo || "";
  document.getElementById("descPonto").value = ponto.Descrição || "";
  document.getElementById("imgPonto").value = ponto.img || "";
  document.getElementById("horarioPonto").value = ponto.Horario || "";
  document.getElementById("precoPonto").value = ponto.Preco || "";
  document.getElementById("dicasPonto").value = ponto.Dicas || "";
  document.getElementById("latPonto").value = ponto.Lat || "";
  document.getElementById("lngPonto").value = ponto.Lng || "";

  pontoSendoEditado = ponto;

  botaoForm.innerText = "Salvar Alterações ✏️";
  botaoForm.classList.replace( "btn-success", "btnColor");
  botaoCancelar.classList.remove("d-none");

  // Atualiza o título
  const tituloFormulario = document.getElementById("tituloFormulario");
  tituloFormulario.innerText = "✏️ Atualizar Ponto";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetarFormulario() {
  formCadastro.reset();
  pontoSendoEditado = null;
  botaoForm.innerText = "➕ Adicionar Ponto";
  botaoForm.classList.replace("btn-success", "btn-primary");
  botaoCancelar.classList.add("d-none");

  // Reseta o título
  const tituloFormulario = document.getElementById("tituloFormulario");
  tituloFormulario.innerText = "➕ Cadastrar Novo Ponto";
}


function resetarFormulario() {
  formCadastro.reset();
  pontoSendoEditado = null;
  botaoForm.innerText = "➕ Adicionar Ponto";
  botaoForm.classList.replace("btn-success", "btn-primary");
  botaoCancelar.classList.add("d-none");
}

// ----------- EXCLUIR ----------------
async function excluirPonto(event, id, nome) {
  event.preventDefault();
  event.stopPropagation();
  if (confirm(`Excluir "${nome}"?`)) {
    await fetch(`${ENDPOINT_API}/${id}`, { method: "DELETE" });
    todosOsPontos = todosOsPontos.filter(p => p.id !== id);
    aplicarFiltros();
    popularFiltroTipos();
  }
}

// ----------- API ----------------
async function adicionarPontoAPI(ponto) {
  const res = await fetch(ENDPOINT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ponto) });
  if (!res.ok) throw new Error("Erro API");
  const data = await res.json();
  mostrarMensagem("Ponto criado com sucesso! 🎉", "success");
  return data;
}

async function atualizarPontoAPI(id, ponto) {
  const res = await fetch(`${ENDPOINT_API}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ponto) });
  if (!res.ok) throw new Error("Erro API");
  mostrarMensagem("Alterações salvas!", "primary");
  return await res.json();
}

// ----------- MENSAGENS ----------------
function mostrarMensagem(texto, tipo = "success", tempo = 3000) {
  const container = document.getElementById("mensagens");
  const alerta = document.createElement("div");
  alerta.className = `alert alert-${tipo} alert-dismissible fade show shadow`;
  alerta.role = "alert";
  alerta.innerHTML = `${texto}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  container.appendChild(alerta);
  setTimeout(() => { alerta.classList.remove("show"); setTimeout(() => alerta.remove(), 150); }, tempo);
}

// ----------- EVENTOS ----------------
buscaInput.addEventListener("keyup", aplicarFiltros);
filtroTipoSelect.addEventListener("change", aplicarFiltros);
botaoCancelar.addEventListener("click", resetarFormulario);
carregarDados();
