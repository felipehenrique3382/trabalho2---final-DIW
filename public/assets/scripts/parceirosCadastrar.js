const API_URL = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/parcerias";
let todosParceiros = [];

const btnSalvar = document.getElementById("btnSalvar");
const tituloModal = document.getElementById("tituloModal");

document.addEventListener("DOMContentLoaded", async () => {
    const parceiroId = new URLSearchParams(window.location.search).get("id");

    try {
        const res = await fetch(API_URL);
        todosParceiros = await res.json();
    } catch (err) {
        console.error(err);
        todosParceiros = [];
    }

    if (parceiroId) {
        const parceiroEditar = todosParceiros.find(p => p.id === parceiroId);
        if (parceiroEditar) {
            preencherFormulario(parceiroEditar);
            tituloModal.textContent = "Atualizar Parceiro";
            btnSalvar.textContent = "Atualizar";
            btnSalvar.classList.remove("btn-primary");
            btnSalvar.classList.add("btn-success");
        }
    }

    document.getElementById("formCadastro").addEventListener("submit", async (event) => {
        event.preventDefault();
        const dados = obterDadosFormulario();
        if (parceiroId) {
            dados.id = parceiroId;
            await editarParceiro(dados);
        } else {
            await criarParceiro(dados);
        }
    });
});

function preencherFormulario(parceiro) {
    document.getElementById("nome").value = parceiro.nome || "";
    document.getElementById("categoria").value = parceiro.categoria || "";
    document.getElementById("subcategoria").value = parceiro.subcategoria || "";
    document.getElementById("descricao_curta").value = parceiro.descricao_curta || "";
    document.getElementById("descricao_longa").value = parceiro.descricao_longa || "";
    document.getElementById("endereco").value = parceiro.endereco || "";
    document.getElementById("preco_info").value = parceiro.preco_info || "";
    document.getElementById("desconto_pontour").value = parceiro.desconto_pontour || "";
    document.getElementById("imagens").value = parceiro.imagens ? parceiro.imagens.join("\n") : "";
}

function obterDadosFormulario() {
    return {
        nome: document.getElementById("nome").value.trim(),
        categoria: document.getElementById("categoria").value.trim(),
        subcategoria: document.getElementById("subcategoria").value.trim(),
        descricao_curta: document.getElementById("descricao_curta").value.trim(),
        descricao_longa: document.getElementById("descricao_longa").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        preco_info: document.getElementById("preco_info").value.trim(),
        desconto_pontour: document.getElementById("desconto_pontour").value.trim(),
        imagens: document.getElementById("imagens").value
            .split("\n")
            .map(url => url.trim())
            .filter(url => url !== "")
    };
}

async function criarParceiro(parceiro) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parceiro)
        });
        if (!res.ok) throw new Error("Erro ao criar parceiro");
        mostrarMensagem("Parceiro criado com sucesso!");
        document.getElementById("formCadastro").reset();
    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro ao criar parceiro.", "danger");
    }
}

async function editarParceiro(parceiro) {
    try {
        const res = await fetch(`${API_URL}/${parceiro.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parceiro)
        });
        if (!res.ok) throw new Error("Erro ao editar parceiro");
        mostrarMensagem("Parceiro atualizado com sucesso!");
    } catch (err) {
        console.error(err);
        mostrarMensagem("Erro ao atualizar parceiro.", "danger");
    }
}

function mostrarMensagem(texto, tipo = "success") {
    let container = document.getElementById("mensagem");
    if (!container) return;
    container.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    setTimeout(() => container.innerHTML = "", 3000);
}
