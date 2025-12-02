const API = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/eventos";
const form = document.getElementById("form-cadastro");
const mensagemDiv = document.getElementById("mensagem");
const btnSalvar = document.getElementById("btnSalvar");
const tituloModal = document.getElementById("tituloModal");

let id = null; 

// Preencher formulário se houver ID na URL
window.addEventListener("DOMContentLoaded", async () => {
    id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error("Erro ao buscar evento");
        const evento = await res.json();

        
        document.getElementById("titulo").value = evento.titulo;
        document.getElementById("data").value = evento.data;
        document.getElementById("logradouro").value = evento.endereco.logradouro;
        document.getElementById("numero").value = evento.endereco.numero;
        document.getElementById("bairro").value = evento.endereco.bairro;
        document.getElementById("cidade").value = evento.endereco.cidade;
        document.getElementById("estado").value = evento.endereco.estado;
        document.getElementById("cep").value = evento.endereco.cep || "";
        document.getElementById("imagem").value = evento.imagem || "";

        
        tituloModal.textContent = "Atualizar Evento";
        btnSalvar.textContent = "Atualizar";

    } catch (erro) {
        console.error("Erro ao carregar dados do evento:", erro);
        
    }
});

// Enviar formulário
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const evento = {
        titulo: document.getElementById("titulo").value.trim(),
        data: document.getElementById("data").value,
        endereco: {
            logradouro: document.getElementById("logradouro").value.trim(),
            numero: document.getElementById("numero").value.trim(),
            bairro: document.getElementById("bairro").value.trim(),
            cidade: document.getElementById("cidade").value.trim(),
            estado: document.getElementById("estado").value.trim(),
            cep: document.getElementById("cep").value.trim()
        },
        imagem: document.getElementById("imagem").value.trim()
    };

    try {
        const metodo = id ? "PUT" : "POST";
        const url = id ? `${API}/${id}` : API;

        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(evento)
        });

        if (!res.ok) throw new Error("Erro ao salvar evento");

        mostrarMensagem(id ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!", "success");
        form.reset();

        setTimeout(() => window.location.href = "eventos.html", 2000);
    } catch (erro) {
        console.error(erro);
        mostrarMensagem("Erro ao salvar evento.", "danger");
    }
});

// Função para exibir mensagens
function mostrarMensagem(texto, tipo) {
    mensagemDiv.innerHTML = `
        <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
            ${texto}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
        </div>`;
    setTimeout(() => {
        const alert = mensagemDiv.querySelector('.alert');
        if (alert) alert.remove();
    }, 3000);
}
