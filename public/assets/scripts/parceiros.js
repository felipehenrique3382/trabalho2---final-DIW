const API_URL = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/parcerias";
let todosParceiros = [];

document.addEventListener("DOMContentLoaded", async () => {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado") || "null");

    const btnNovoEvento = document.getElementById("btnNovoEvento");
    if (!usuario || usuario.tipo !== "admin") {
        btnNovoEvento.style.display = "none";
    } else {
        btnNovoEvento.addEventListener("click", () => {
            window.location.href = "parceirosCadastro.html";
        });
    }

    await carregarParceiros();
    renderizarParceiros(todosParceiros, usuario);

    document.getElementById("filtroCategoria").addEventListener("change", () => {
        aplicarFiltro(usuario);
    });
});

async function carregarParceiros() {
    try {
        const res = await fetch(API_URL);
        todosParceiros = await res.json();
    } catch(err) {
        console.error(err);
        todosParceiros = [];
    }
}

function renderizarParceiros(parceiros, usuario) {
    const lista = document.getElementById("listaParceiros");
    lista.innerHTML = "";

    if (!parceiros.length) {
        lista.innerHTML = `<p class="col-12 text-center text-muted">Nenhum parceiro encontrado.</p>`;
        return;
    }

    parceiros.forEach(parceiro => {
        const carouselId = `carousel-${parceiro.id}`;
        let itens = parceiro.imagens.map((url, i) => `
            <div class="carousel-item ${i===0?'active':''}">
                <img src="${url}" class="d-block w-100" alt="${parceiro.nome}" style="height:200px; object-fit:cover;">
            </div>`).join("");

        let controles = parceiro.imagens.length>1 ? `
            <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
            </button>` : "";

        let adminBtns = "";
        if (usuario && usuario.tipo === "admin") {
            adminBtns = `
                <div class="mt-2 d-flex gap-2">
                    <a href="parceirosCadastro.html?id=${parceiro.id}" class="btn btn-sm btn-warning flex-grow-1">Editar</a>
                    <button class="btn btn-sm btn-danger flex-grow-1" onclick="excluirParceiro('${parceiro.id}')">Excluir</button>
                </div>`;
        }

        lista.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm">
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-inner">${itens}</div>
                        ${controles}
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title  fw-bold">${parceiro.nome}</h5>
                        <span class="badge btnColor mb-2">${parceiro.categoria}</span>
                        <p class="card-text">${parceiro.descricao_curta}</p>
                        <p class="card-text fw-bold mb-1">${parceiro.preco_info}</p>
                        <p class="card-text text-success">${parceiro.desconto_pontour}</p>
                        <a href="parceirosDetalhes.html?id=${parceiro.id}" class="btn btnColor mt-auto">Ver Detalhes</a>
                        ${adminBtns}
                    </div>
                </div>
            </div>`;
    });
}

function aplicarFiltro(usuario) {
    const cat = document.getElementById("filtroCategoria").value;
    renderizarParceiros(cat==="todos"? todosParceiros : todosParceiros.filter(p => p.categoria===cat), usuario);
}

async function excluirParceiro(id) {
    if (!confirm("Deseja realmente excluir este parceiro?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    todosParceiros = todosParceiros.filter(p => p.id!==id);
    renderizarParceiros(todosParceiros, JSON.parse(localStorage.getItem("usuarioLogado") || "null"));
    alert("Parceiro excluído com sucesso!");
}
