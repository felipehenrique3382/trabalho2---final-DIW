// Espera o DOM estar carregado
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const parceiroId = params.get('id'); 
  let parceiroEncontrado = null;

  if (!parceiroId) {
    renderizarDetalhes(null);
    return;
  }

  try {
    const response = await fetch('https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/parcerias'); 
    if (!response.ok) {
        throw new Error(`Erro ao buscar JSON: ${response.statusText}`);
    }
    const data = await response.json();
    parceiroEncontrado = data.find(p => p.id == parceiroId);

  } catch (error) {
    console.error('Erro ao carregar dados do parceiro:', error);
  }

  renderizarDetalhes(parceiroEncontrado);
});


 //Renderiza os detalhes de um parceiro.
function renderizarDetalhes(parceiro) {
  const detalheParceiroDiv = document.getElementById('detalheParceiro');
  
  if (!parceiro) {
    detalheParceiroDiv.innerHTML = `
      <div class="col-12 text-center">
        <h1 class="fw-bold text-danger">Parceiro não encontrado</h1>
        <p class="text-muted">O ID solicitado não existe ou não foi fornecido.</p>
        <a href="parceiros.html" class="btn btn-primary">Voltar para a lista</a>
      </div>
    `;
    return;
  }

  document.title = `${parceiro.nome} - Pontour`;

  // Carrossel de imagens
  const carouselId = `carousel-detalhe-${parceiro.id}`;
  let indicadoresHtml = '';
  let carouselItensHtml = '';

  parceiro.imagens.forEach((imgUrl, index) => {
    const activeClass = index === 0 ? 'active' : '';
    indicadoresHtml += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" ${activeClass ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${index + 1}"></button>`;
    carouselItensHtml += `
      <div class="carousel-item ${activeClass}">
        <img src="${imgUrl}" class="d-block w-100" alt="${parceiro.nome}" style="height: 400px; object-fit: cover;">
      </div>
    `;
  });

  const carouselHtml = `
    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
      <div class="carousel-indicators">
        ${indicadoresHtml}
      </div>
      <div class="carousel-inner">
        ${carouselItensHtml}
      </div>
      ${parceiro.imagens.length > 1 ? `
      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
      ` : ''}
    </div>
  `;

  // HTML final da página de detalhes
  detalheParceiroDiv.innerHTML = `
    <div class="col-lg-10">
      <div class="card shadow-sm overflow-hidden">
        <div class="row g-0">
          <div class="col-md-6">
            ${carouselHtml} 
          </div>
          <div class="col-md-6">
            <div class="card-body p-4 p-md-5">
              <span class="badge bg-primary mb-2">${parceiro.categoria} / ${parceiro.subcategoria}</span>
              <h1 class="card-title fw-bold">${parceiro.nome}</h1>
              <p class="card-text text-muted">${parceiro.descricao_longa}</p>
              
              <h5 class="fw-bold mt-4">Preços e Condições</h5>
              <p>${parceiro.preco_info}</p>

              <h5 class="fw-bold mt-4 text-success">Desconto Pontour</h5>
              <p class="text-success">${parceiro.desconto_pontour}</p>
              
              <h5 class="fw-bold mt-4">Endereço</h5>
              <p>${parceiro.endereco}</p>
              
              <a href="parceiros.html" class="btn btn-outline-secondary mt-3">Voltar para a lista</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
