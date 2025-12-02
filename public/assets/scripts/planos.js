document.addEventListener("DOMContentLoaded", async () => {
  const listaPlanos = document.getElementById("lista-planos");
  const btnNovoPlano = document.getElementById("btnNovoPlano");
  const usuarioLogado = JSON.parse(
    localStorage.getItem("usuarioLogado") || "null",
  );
  const urlPlanos =
    "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/planos"; 

  if (usuarioLogado?.tipo === "admin")
    btnNovoPlano.style.display = "inline-block";

  function mostrarMensagem(texto, tipo = "success") {
    const divContainer = document.getElementById("mensagem-container");
    divContainer.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${texto}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
    setTimeout(() => (divContainer.innerHTML = ""), 3000);
  }

  function criarCard(plano) {
    const li = document.createElement("div");
    li.className = "col-12 col-sm-6 col-md-4 mb-4"; 

    li.innerHTML = `
  <div class="card h-100 shadow-sm">

    ${
      plano.imagem
        ? `
      <img src="${plano.imagem}" class="card-img-top" alt="${plano.nome}"
        style="height: 180px; object-fit: cover; border-bottom: 1px solid #ddd;">
    `
        : `
      <img src="https://via.placeholder.com/400x200?text=Plano" 
        class="card-img-top" style="height: 180px; object-fit: cover;">
    `
    }

    <div class="card-body d-flex flex-column">
      <h5 class="card-title fw-bold">${plano.nome}</h5>
      <p class="card-text">${plano.descricao || ""}</p>

      ${
        plano.beneficios
          ? `
        <ul class="list-group list-group-flush mb-3">
          ${plano.beneficios
            .map((b) => `<li class="list-group-item">${b}</li>`)
            .join("")}
        </ul>
      `
          : ""
      }

      <h5 class="fw-bold mb-3 text-center">
        R$ ${plano.preco.toFixed(2)} / mês
      </h5>

      <div class="d-flex justify-content-center gap-2 mt-auto flex-wrap">
        <button class="btn btnColor btn-lg btnAssinar"
          data-preco="${plano.preco}" 
          data-produto="${plano.nome}" 
          data-id="${plano.id}">
          Assinar
        </button>

        ${
          usuarioLogado?.tipo === "admin"
            ? `
          <button class="btn btn-warning btn-sm btnEditar" data-id="${plano.id}">Editar</button>
          <button class="btn btn-danger btn-sm btnExcluir" data-id="${plano.id}">Excluir</button>
        `
            : ""
        }
      </div>
    </div>
  </div>
`;

    listaPlanos.appendChild(li);
  }

  async function carregarPlanos() {
    try {
      const res = await fetch(urlPlanos);
      if (!res.ok) throw new Error("Erro ao buscar planos");
      const planos = await res.json();
      listaPlanos.innerHTML = "";
      planos.forEach(criarCard);

      // Botão Assinar
      document.querySelectorAll(".btnAssinar").forEach((btn) => {
        btn.onclick = () => {
          const preco = btn.dataset.preco;
          const produto = btn.dataset.produto;
          window.location.href = `pagamentos.html?preco=${preco}&produto=${produto}`;
        };
      });

      // Botão Editar
      document.querySelectorAll(".btnEditar").forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const plano = await (await fetch(`${urlPlanos}/${id}`)).json();

          document.getElementById("nomePlano").value = plano.nome || "";
          document.getElementById("precoPlano").value = plano.preco || "";
          document.getElementById("imagemPlano").value = plano.imagem || "";
          document.getElementById("descricaoPlano").value =
            plano.descricao || "";
          document.getElementById("beneficiosPlano").value = (
            plano.beneficios || []
          ).join("\n");

          const modalEl = document.getElementById("modalPlano");
          const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();

          const salvarBtn = document.getElementById("salvarPlano");
          // remove handlers anteriores antes de setar
          salvarBtn.onclick = null;
          salvarBtn.onclick = async () => {
            const nome = document.getElementById("nomePlano").value.trim();
            const preco = parseFloat(
              document.getElementById("precoPlano").value,
            );
            const imagem =
              document.getElementById("imagemPlano").value.trim() || null;
            const descricao = document
              .getElementById("descricaoPlano")
              .value.trim();
            const beneficios = document
              .getElementById("beneficiosPlano")
              .value.trim()
              .split("\n")
              .filter((b) => b);

            if (!nome || isNaN(preco))
              return mostrarMensagem("Preencha nome e preço!", "danger");

            try {
              await fetch(`${urlPlanos}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  nome,
                  preco,
                  descricao,
                  beneficios,
                  imagem,
                }),
              });
              mostrarMensagem("Plano atualizado com sucesso!", "info");
              modal.hide();
              carregarPlanos();
            } catch (err) {
              mostrarMensagem("Erro ao atualizar plano!", "danger");
            }
          };
        };
      });

      // Botão Excluir
      document.querySelectorAll(".btnExcluir").forEach((btn) => {
        btn.onclick = async () => {
          if (!confirm("Deseja realmente excluir este plano?")) return;
          const id = btn.dataset.id;
          try {
            await fetch(`${urlPlanos}/${id}`, { method: "DELETE" });
            mostrarMensagem("Plano excluído com sucesso!", "danger");
            carregarPlanos();
          } catch (err) {
            mostrarMensagem("Erro ao excluir plano!", "danger");
          }
        };
      });
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao carregar planos!", "danger");
    }
  }

  btnNovoPlano.onclick = () => {
    document.getElementById("nomePlano").value = "";
    document.getElementById("precoPlano").value = "";
    document.getElementById("imagemPlano").value = "";
    document.getElementById("descricaoPlano").value = "";
    document.getElementById("beneficiosPlano").value = "";

    const modalEl = document.getElementById("modalPlano");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const salvarBtn = document.getElementById("salvarPlano");
    // remove handlers anteriores antes de setar
    salvarBtn.onclick = null;
    salvarBtn.onclick = async () => {
      const nome = document.getElementById("nomePlano").value.trim();
      const preco = parseFloat(document.getElementById("precoPlano").value);
      const imagem =
        document.getElementById("imagemPlano").value.trim() || null;
      const descricao = document.getElementById("descricaoPlano").value.trim();
      const beneficios = document
        .getElementById("beneficiosPlano")
        .value.trim()
        .split("\n")
        .filter((b) => b);

      if (!nome || isNaN(preco))
        return mostrarMensagem("Preencha nome e preço!", "danger");

      try {
        await fetch(urlPlanos, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nome, preco, descricao, beneficios, imagem }),
        });
        mostrarMensagem("Plano criado com sucesso!", "success");
        modal.hide();
        carregarPlanos();
      } catch (err) {
        mostrarMensagem("Erro ao criar plano!", "danger");
      }
    };
  };

  carregarPlanos();
});
