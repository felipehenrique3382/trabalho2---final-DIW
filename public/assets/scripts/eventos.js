const API = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/eventos";
const lista = document.getElementById("lista-eventos");
const pesquisa = document.getElementById("pesquisa");

async function carregarEventos() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Erro ao carregar eventos");
        const eventos = await res.json();
        render(eventos);
        pesquisa.oninput = () => filtrar(eventos);
    } catch {
        lista.innerHTML = `<p class="text-danger">Erro ao carregar eventos.</p>`;
    }
}

function filtrar(eventos) {
    const termo = pesquisa.value.toLowerCase();
    const filtrados = eventos.filter(e =>
        e.titulo.toLowerCase().includes(termo) ||
        e.endereco.cidade.toLowerCase().includes(termo) ||
        e.endereco.bairro.toLowerCase().includes(termo)
    );
    render(filtrados);
}

function render(eventos) {
    lista.innerHTML = eventos.length
        ? eventos.map(e => templateCard(e)).join("")
        : `<p>Nenhum evento encontrado.</p>`;
    addEventosBtns();
}

function templateCard(e) {
    return `
    <div class="col-lg-4 col-md-6 col-sm-12">
      <div class="card shadow-sm h-100">
        ${e.imagem ? `<img src="${e.imagem}" class="card-img-top" style="height:200px; object-fit:cover;" alt="${e.titulo}">` : ""}
        <div class="card-body">
          <h5 class="card-title">${e.titulo}</h5>
          <p><strong>Data:</strong> ${e.data}</p>
          <p><strong>Endereço:</strong> ${e.endereco.logradouro}, ${e.endereco.numero}</p>
          <p>${e.endereco.bairro}, ${e.endereco.cidade} - ${e.endereco.estado}</p>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-warning btn-sm btnEditar" data-id="${e.id}">Editar</button>
            <button class="btn btn-danger btn-sm btnExcluir" data-id="${e.id}">Excluir</button>
          </div>
        </div>
      </div>
    </div>
    `;
}

function addEventosBtns() {
    document.querySelectorAll(".btnEditar").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            window.location.href = `eventosCadastrar.html?id=${id}`;
        };
    });

    document.querySelectorAll(".btnExcluir").forEach(btn => {
        btn.onclick = async () => {
            if (!confirm("Deseja realmente excluir este evento?")) return;
            const id = btn.dataset.id;
            try {
                await fetch(`${API}/${id}`, { method: "DELETE" });
                carregarEventos();
            } catch {
                alert("Erro ao excluir evento!");
            }
        };
    });
}

carregarEventos();
