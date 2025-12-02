let promo = {};

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  await buscarPromo(id);
  apresentarDetalhesDaPromo();
});

const buscarPromo = async (id) => {
  try {
    const replit = "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/";
    const url = replit + "promo/" + id;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    promo = await res.json();
  } catch (erro) {
    console.error("Erro ao buscar promoção:", erro);
    promo = null;
  }
};

const apresentarDetalhesDaPromo = () => {
  const container = document.getElementById("painel-de-detalhes");

  if (promo && promo.id !== undefined) {
    container.innerHTML = `
      <div class="row g-4 align-items-center shadow-sm p-3 bg-white rounded">
        <div class="col-md-6">
          <img src="${promo.imagem}" alt="${promo.titulo}" class="img-fluid rounded" style="width:100%; max-height:450px; object-fit:cover;">
        </div>
        <div class="col-md-6">
          <h2 class="fw-bold mb-3">${promo.titulo}</h2>
          <p class="text-muted mb-1">${promo.categoria} - ${promo.data}</p>
          <p class="text-success fw-bold mb-2">Autor: ${promo.autor}</p>
          <p class="mb-1">Preço Original: <del>R$ ${promo.precoOriginal.toFixed(2)}</del></p>
          <p class="mb-1 text-danger">Desconto: ${promo.desconto}%</p>
          <p class="h5 text-primary mb-3">Preço Promocional: R$ ${promo.precoPromocional.toFixed(2)}</p>
          <p class="lead mb-4">${promo.conteudo}</p>
          <div class="d-flex gap-2 flex-wrap">
            <a href="promo.html" class="btn btnSecondary flex-grow-1 flex-md-auto">Voltar</a>
            <a href="pagamentos.html?produto=${encodeURIComponent(promo.titulo)}&preco=${promo.precoPromocional.toFixed(2)}" class="btn btnColor flex-grow-1 flex-md-auto">Finalizar Compra</a>
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `<h3 class="text-center text-danger mt-5">Promoção não encontrada!</h3>`;
  }
};
