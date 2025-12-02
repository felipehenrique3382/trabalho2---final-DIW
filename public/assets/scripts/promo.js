document.addEventListener("DOMContentLoaded", () => {
  const API = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/promo";
  const lista = document.getElementById("lista-promos");
  const pesquisa = document.getElementById("pesquisa");
  const form = document.getElementById("formPromo");
  const modalEl = document.getElementById("modalPromo");
  const modal = new bootstrap.Modal(modalEl);
  const btnNovo = document.getElementById("btnNovoPromo");

  let usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {};

  // Div de mensagens
  let mensagemDiv = document.getElementById("mensagem");
  if (!mensagemDiv) {
    mensagemDiv = document.createElement("div");
    mensagemDiv.id = "mensagem";
    mensagemDiv.className = "container mt-2";
    document.body.prepend(mensagemDiv);
  }

  const mostrarMensagem = (texto, tipo = "success") => {
    mensagemDiv.innerHTML = `
      <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
        ${texto}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
    setTimeout(() => mensagemDiv.innerHTML = "", 4000);
  };

  if (usuario.tipo !== "admin") btnNovo.style.display = "none";

  btnNovo?.addEventListener("click", () => {
    form.reset();
    document.getElementById("promoId").value = "";
    document.getElementById("precoPromocional").value = "";
    modalEl.querySelector(".modal-title").textContent = "Cadastrar Promoção";
    modal.show();
  });

  // Atualizar preço promocional ao digitar
  const precoOriginalInput = document.getElementById("precoOriginal");
  const descontoInput = document.getElementById("desconto");
  const precoPromocionalInput = document.getElementById("precoPromocional");

  const atualizarPrecoPromocional = () => {
    const preco = parseFloat(precoOriginalInput.value) || 0;
    const desconto = parseFloat(descontoInput.value) || 0;
    const promocional = preco * (1 - desconto / 100);
    precoPromocionalInput.value = `R$ ${promocional.toFixed(2)}`;
  };

  precoOriginalInput.addEventListener("input", atualizarPrecoPromocional);
  descontoInput.addEventListener("input", atualizarPrecoPromocional);

  async function carregarPromos() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();
      const promos = await res.json();
      render(promos);
      pesquisa.oninput = () => filtrar(promos);
    } catch {
      lista.innerHTML = `<p class="text-danger">Erro ao carregar promoções.</p>`;
      mostrarMensagem("Erro ao carregar promoções.", "danger");
    }
  }

  function filtrar(promos) {
    const termo = pesquisa.value.toLowerCase();
    const filtrados = promos.filter(p =>
      p.titulo.toLowerCase().includes(termo) ||
      p.categoria.toLowerCase().includes(termo)
    );
    render(filtrados);
  }

  function render(promos) {
    lista.innerHTML = promos.length
      ? promos.map(p => templateCard(p)).join("")
      : `<p>Nenhuma promoção encontrada.</p>`;
    addEventosBtns();
  }

  function templateCard(p) {
    return `
      <div class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <img src="${p.imagem}" class="card-img-top" alt="${p.titulo}">
          <div class="card-body text-center">
            <h5 class="card-title fw-bold">${p.titulo}</h5>
            <p class="text-muted">${p.categoria} - ${p.data}</p>
            <p>${p.conteudo.substring(0, 60)}...</p>
            <p class="text-success fw-bold">Autor: ${p.autor}</p>
            <p class="fw-bold">Preço: R$ ${parseFloat(p.precoPromocional).toFixed(2)}</p>
            <a href="promoDetalhes.html?id=${p.id}" class="btn btnColor w-100 mb-2">VER DETALHES</a>
            ${usuario.tipo === "admin" ? `
            <div class="d-flex justify-content-between">
              <button class="btn btn-warning btn-sm btnEditar" data-id="${p.id}">Editar</button>
              <button class="btn btn-danger btn-sm btnExcluir" data-id="${p.id}">Excluir</button>
            </div>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function addEventosBtns() {
    if (usuario.tipo !== "admin") return;

    document.querySelectorAll(".btnEditar").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        try {
          const res = await fetch(`${API}/${id}`);
          if (!res.ok) throw new Error();
          const promo = await res.json();

          document.getElementById("promoId").value = promo.id;
          document.getElementById("titulo").value = promo.titulo;
          document.getElementById("categoria").value = promo.categoria;
          document.getElementById("data").value = promo.data;
          document.getElementById("conteudo").value = promo.conteudo;
          document.getElementById("autor").value = promo.autor;
          document.getElementById("imagem").value = promo.imagem;
          document.getElementById("precoOriginal").value = promo.precoOriginal || 0;
          document.getElementById("desconto").value = promo.desconto || 0;
          atualizarPrecoPromocional();

          modalEl.querySelector(".modal-title").textContent = "Editar Promoção";
          modal.show();
        } catch {
          mostrarMensagem("Erro ao carregar promoção para edição!", "danger");
        }
      };
    });

    document.querySelectorAll(".btnExcluir").forEach(btn => {
      btn.onclick = async () => {
        if (!confirm("Deseja realmente excluir esta promoção?")) return;
        const id = btn.dataset.id;
        try {
          const res = await fetch(`${API}/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error();
          mostrarMensagem("Promoção excluída com sucesso!", "danger");
          carregarPromos();
        } catch {
          mostrarMensagem("Erro ao excluir promoção!", "danger");
        }
      };
    });
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const id = document.getElementById("promoId").value;
    const precoOriginal = parseFloat(document.getElementById("precoOriginal").value) || 0;
    const desconto = parseFloat(document.getElementById("desconto").value) || 0;
    const precoPromocional = precoOriginal * (1 - desconto / 100);

    const promo = {
      titulo: document.getElementById("titulo").value,
      categoria: document.getElementById("categoria").value,
      data: document.getElementById("data").value,
      conteudo: document.getElementById("conteudo").value,
      autor: document.getElementById("autor").value,
      imagem: document.getElementById("imagem").value,
      precoOriginal,
      desconto,
      precoPromocional
    };

    try {
      const metodo = id ? "PUT" : "POST";
      const url = id ? `${API}/${id}` : API;
      const res = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promo)
      });
      if (!res.ok) throw new Error();

      mostrarMensagem(id ? "Promoção atualizada com sucesso!" : "Promoção criada com sucesso!", "success");
      modal.hide();
      carregarPromos();
    } catch {
      mostrarMensagem("Erro ao salvar promoção!", "danger");
    }
  };

  carregarPromos();
});
