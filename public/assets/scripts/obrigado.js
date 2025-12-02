const replit =
  "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    document.getElementById("resumo").innerHTML =
      "<p class='text-danger'>Erro: ID do pagamento não encontrado.</p>";
    return;
  }

  // Buscar dados específicos do pagamento via GET /pagamentos/{id}
  try {
    const response = await fetch(`${replit}pagamentos/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${response.status}`);
    }
    const pagamento = await response.json();

    // Exibir resumo com dados do JSON
    const resumoDiv = document.getElementById("resumo");
    resumoDiv.classList.remove("loading");
    resumoDiv.innerHTML = `
          <h5>Resumo do Pagamento:</h5>
           <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Data:</strong> ${
              pagamento.data || "N/A"
            }</li>
            <li class="list-group-item"><strong>Produto:</strong> ${
              pagamento.produto || "N/A"
            }</li>
            <li class="list-group-item"><strong>Nome:</strong> ${
              pagamento.nome || "N/A"
            }</li>
            <li class="list-group-item"><strong>Email:</strong> ${
              pagamento.email || "N/A"
            }</li>
            <li class="list-group-item"><strong>Valor:</strong> R$ ${
              pagamento.valor ? pagamento.valor.toFixed(2) : "0.00"
            }</li>
            <li class="list-group-item"><strong>Forma:</strong> ${
              pagamento.forma || "N/A"
            }</li>
            <li class="list-group-item"><strong>Status:</strong> ${
              pagamento.status || "Pendente"
            }</li>
            <li class="list-group-item"><strong>ID:</strong> ${
              pagamento.id || "N/A"
            }</li>
          </ul>

        `;
  } catch (error) {
    console.error("Erro ao carregar dados do pagamento:", error);
    document.getElementById("resumo").innerHTML =
      "<p class='text-danger'>Erro ao carregar dados. Tente novamente.</p>";
  }
});
