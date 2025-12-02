let pagamentos = [];
let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));


let chartPagamentos; // referência global do gráfico
const replit =
  "https://29eb045c-0f1e-486a-8113-adc8fe96c886-00-9201oqxy3d9k.riker.replit.dev/";

document.addEventListener("DOMContentLoaded", async () => {
  const inputTotal = document.getElementById("valor");
  const params = new URLSearchParams(window.location.search);
  const preco = params.get("preco");
  if (preco) inputTotal.value = `R$ ${preco}`;

  const cartao = document.getElementById("cartao");
  const pix = document.getElementById("pix");
  const boleto = document.getElementById("boleto");
  const camposCartao = document.getElementById("camposCartao");
  const camposCPF = document.getElementById("camposCPF");

  const mostrarCampos = () => {
    if (cartao.checked) {
      camposCartao.classList.remove("d-none");
      camposCPF.classList.add("d-none");
    } else if (pix.checked || boleto.checked) {
      camposCPF.classList.remove("d-none");
      camposCartao.classList.add("d-none");
    }
  };

  const validarCampos = () => {
    const numeroCartao = document.getElementById("numeroCartao");
    const validade = document.getElementById("validade");
    const cvv = document.getElementById("cvv");
    const cpf = document.getElementById("cpf");

    if(cartao.checked){
      if(!numeroCartao.value || numeroCartao.value.length !== 19 )
          return "Número do cartão inválido";
      if(!validade.value || validade.value.length !== 5)
          return "Válidade inválida";
      if(!cvv.value || cvv.value.length !== 3)
          return "CVC inválido"
    }
    if(pix.checked || boleto.checked){
      if(!cpf.value || cpf.value.length !== 14){
        return "CPF inválido"
      }
    }
    if(!cartao.checked && !pix.checked && !boleto.checked){
      return "Selecione uma forma de pagamento"
    }
    return true
  }

  cartao.addEventListener("change", mostrarCampos);
  pix.addEventListener("change", mostrarCampos);
  boleto.addEventListener("change", mostrarCampos);

  await carregarPagamentos();
  exibirTabelaPagamentos();

  const formPagamento = document.getElementById("formPagamento");
  formPagamento.addEventListener("submit", async (event) => {
    event.preventDefault();
    const validacao = validarCampos();
    if(validacao !== true){
      alert(validacao)
      return
    }
    await registrarPagamento();
  });
});

// Função para formatar moeda
const formatarMoeda = (valor) => {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Registrar novo pagamento
const registrarPagamento = async () => {
  const data = new Date().toLocaleDateString("pt-BR");
  const params = new URLSearchParams(window.location.search);
  const produto = params.get("produto");
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const valor = parseFloat(
    document.getElementById("valor").value.replace("R$", "").replace(",", ".")
  );
  let forma;
  if (document.getElementById("cartao").checked) forma = "Cartão";
  else if (document.getElementById("pix").checked) forma = "PIX";
  else if (document.getElementById("boleto").checked) forma = "Boleto";

  const dadosPagamento = { data, produto, nome, email, valor, forma, status: "Pendente",usuarioId: usuarioLogado.id   };

  await fetch(replit + "pagamentos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosPagamento),
  })
    .then((response) => response.json())
    .then((novoPagamento) => {
      pagamentos.unshift(novoPagamento);
      exibirTabelaPagamentos();
      return atualizarStatusPagamento(novoPagamento.id, "Aprovado").then(() => {
        document.getElementById("formPagamento").reset();
        document.getElementById("camposCartao").classList.add("d-none");
        window.location.href = `obrigado.html?id=${novoPagamento.id}`;
      });
    })
    .catch((error) => console.error("Error ao registrar pagamento", error));
};

// Carregar dados da API
const carregarPagamentos = async () => {
  const url = replit + "pagamentos";
  await fetch(url)
    .then((response) => response.json())
    .then((json) => (pagamentos = json))
    .catch((error) => {
      console.error("Error ao carregar pagamentos", error);
      pagamentos = [];
    });
};

// Atualizar status
const atualizarStatusPagamento = async (id, novoStatus) => {
  await fetch(`${replit}pagamentos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: novoStatus }),
  })
    .then(() => carregarPagamentos())
    .then(() => exibirTabelaPagamentos())
    .catch((error) => console.error("Erro ao atualizar status", error));
};

// Remover pagamento
const removerPagamento = async (id) => {
  await fetch(`${replit}pagamentos/${id}`, { method: "DELETE" })
    .then(() => carregarPagamentos())
    .then(() => exibirTabelaPagamentos())
    .catch((error) => console.error("Erro ao remover pagamento", error));
};

// Exibir tabela de pagamentos
const exibirTabelaPagamentos = () => {
  const lista = document.getElementById("listaPagamentos");
  lista.innerHTML = "";

  if (!pagamentos || pagamentos.length === 0) {
    lista.innerHTML = `<tr><td colspan="6">Nenhum pagamento realizado ainda.</td></tr>`;
    return;
  }

  // Filtrar apenas pagamentos do usuário logado
  const pagamentosUsuario = pagamentos.filter(
    (p) => p.usuarioId === usuarioLogado.id 
  );

  if (pagamentosUsuario.length === 0) {
    lista.innerHTML = `<tr><td colspan="6">Nenhum pagamento realizado ainda.</td></tr>`;
    return;
  }

  pagamentosUsuario.forEach((pagamento) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${pagamento.data || "-"}</td>
      <td>${pagamento.produto || "-"}</td>
      <td>${pagamento.forma}</td>
      <td>${formatarMoeda(pagamento.valor || 0)}</td>
      <td>${pagamento.status || "Pendente"}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removerPagamento('${pagamento.id}')">Remover</button>
      </td>
    `;
    lista.appendChild(linha);
  });
  // passar só os dados filtrados
  gerarGraficoPagamentos(pagamentosUsuario); 
};


// Gerar gráfico de barras com Chart.js
const gerarGraficoPagamentos = (pagamentosFiltrados) => {
  const ctx = document.getElementById("graficoPagamentos").getContext("2d");

  const formas = ["Cartão", "PIX", "Boleto"];
  const totalPorForma = formas.map((forma) =>
    pagamentosFiltrados
      .filter((p) => p.forma === forma)
      .reduce((acc, p) => acc + (p.valor || 0), 0)
  );

  if (chartPagamentos) {
    chartPagamentos.data.datasets[0].data = totalPorForma;
    chartPagamentos.update();
    return;
  }

  chartPagamentos = new Chart(ctx, {
    type: "bar",
    data: {
      labels: formas,
      datasets: [
        {
          label: "Total Recebido (R$)",
          data: totalPorForma,
          backgroundColor: ["#034AA6", "#A68053", "#A67C6D"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `R$ ${context.raw.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) =>
              value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          },
        },
      },
    },
  });
};

