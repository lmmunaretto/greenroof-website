const unsplashApiKey = "kUg4WZZWtRDakNeUEnfwTlm7Rdb8wbz-Jc_3cF23vXM";
let produtos = [];
let quantidadeTotalCarrinho = 0;
let valorTotalCarrinho = 0;
const role = localStorage.getItem("role");
let pedidoItens = {};

// Imagens e traduções
const arquivosImagens = ["berinjela.jpeg", "cenoura.jpg", "laranjapera.jpeg", "alfacecrespa.jpg", "couvemanteiga.webp", "limaotahiti.jpg"];
const traducoes = { tomate: "tomato", cenoura: "carrot", alface: "lettuce", banana: "yellow banana fruit", maçã: "red apple", melancia: "watermelon", morango: "strawberrys", maracujá: " passion fruit", manga: "mangos fruta" };

// Inicialização ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    const fabOptions = document.querySelector(".fab-options");

    if (role === "Cliente" && !document.getElementById("cart-count")) {
        const cartOption = document.createElement("a");
        cartOption.href = "carrinho.html";
        cartOption.textContent = "Carrinho ";
        const cartCountSpan = document.createElement("span");
        cartCountSpan.id = "cart-count";
        cartCountSpan.textContent = `(0)`;
        cartOption.appendChild(cartCountSpan);
        fabOptions.appendChild(cartOption);
    }

    await carregarPedidoAtual(); 
    await carregarProdutos();
    atualizarQuantidadeCarrinho();
});

async function carregarPedidoAtual() {
    let pedidoId = localStorage.getItem("pedidoId");

    // Se não houver pedidoId no localStorage, buscar na API
    if (!pedidoId) {
        pedidoId = await buscarPedidoAberto();
        if (pedidoId) {
            localStorage.setItem("pedidoId", pedidoId);
        } else {
            return; // Se não encontrar, não continua com a função
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Erro ao carregar o pedido.");

        const pedido = await response.json();
        if (pedido.itemPedido && pedido.itemPedido.$values) {
            pedidoItens = pedido.itemPedido.$values.reduce((acc, item) => {
                acc[item.produtoId] = { quantidade: item.quantidade || 0, preco: item.precoUnitario || 0, itemPedidoId: item.id || null };
                return acc;
            }, {});

            quantidadeTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + (item.quantidade || 0), 0);
            valorTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + (item.quantidade || 0) * (item.preco || 0), 0);
            localStorage.setItem("quantidadeTotalCarrinho", quantidadeTotalCarrinho);
            localStorage.setItem("valorTotalCarrinho", valorTotalCarrinho.toFixed(2));
        }
    } catch (error) {
        console.error("Erro ao carregar itens do pedido:", error);
    }
}

// Função para buscar pedido em aberto na API
async function buscarPedidoAberto() {
    const clienteId = getClienteIdFromToken(); // Assumindo que esta função existe e obtém o clienteId do token
    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Erro ao buscar pedidos em aberto.");

        const pedidos = await response.json();
        const pedidoAberto = pedidos.$values.find(pedido => pedido.clienteId === parseInt(clienteId) && pedido.status === "Aguardando Processamento");
        return pedidoAberto ? pedidoAberto.id : null;// Retorna o id do primeiro pedido em aberto ou null

    } catch (error) {
        console.error("Erro ao buscar pedido em aberto:", error);
        return null;
    }
}

// Carregar produtos da API
async function carregarProdutos() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/produtos`);
        const data = await response.json();
        produtos = data.$values || [];
        exibirProdutos(produtos);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
    }
}

// Exibir produtos no contêiner
function exibirProdutos(produtos) {
    const produtosContainer = document.getElementById("produtosContainer");
    produtosContainer.innerHTML = "";

    produtos.forEach((produto) => {
        const quantidadeInicial = pedidoItens[produto.id]?.quantidade || 0;
        obterImagemProduto(produto.nome).then((imgSrc) => {
            produtosContainer.appendChild(criarElementoProduto(produto, imgSrc, quantidadeInicial));
            obterInformacaoNutricional(produto.id); // Obter informações nutricionais para o produto
        });
    });
}

function criarElementoProduto(produto, imgSrc, quantidadeInicial) {
  const produtoDiv = document.createElement("div");
  produtoDiv.classList.add("produto");

  const botoesQuantidade = role === "Cliente" ? `
      <div class="quantidade-container">
          <button class="btn btn-danger" onclick="alterarQuantidade(${produto.id}, -1, ${produto.preco})">Remover -1</button>
          <span id="quantidade-${produto.id}" class="quantidade">${quantidadeInicial}</span>
          <button class="btn btn-add" onclick="alterarQuantidade(${produto.id}, 1, ${produto.preco})">Adicionar +1</button>
      </div>` : '';

  produtoDiv.innerHTML = `
      <img src="${imgSrc}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)} /KG</p>
      <p>Quantidade disponível: ${produto.quantidade || 0}</p>
      ${botoesQuantidade}
      <div class="nutricional" id="nutricional-${produto.id}">
          <h4>Informações Nutricionais</h4>
          <div id="info-${produto.id}">Carregando...</div>
      </div>
  `;
  return produtoDiv;
}

// Função para alterar quantidade
async function alterarQuantidade(produtoId, ajuste, preco) {
  const quantidadeElement = document.getElementById(`quantidade-${produtoId}`);
  let quantidadeAtual = parseInt(quantidadeElement.textContent) || 0;
  const novaQuantidade = quantidadeAtual + ajuste;

  if (novaQuantidade <= 0) {
      quantidadeAtual = 0;
      await removerItemDoPedido(produtoId);
  } else {
      // Verifica se o produto já existe no pedidoItens
      if (pedidoItens[produtoId]) {
          await atualizarItemDoPedido(produtoId, novaQuantidade, preco); // Atualiza o item existente
      } else {
          await adicionarItemAoPedido(produtoId, novaQuantidade, preco); // Adiciona novo item se ainda não existe
      }
  }

  quantidadeElement.textContent = novaQuantidade;
  exibirAlerta("Carrinho atualizado com sucesso!");
}

// Atualizar contador de quantidade e valor do carrinho
async function atualizarQuantidadeCarrinho() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = `(${quantidadeTotalCarrinho || 0})`;
    }
}

async function adicionarItemAoPedido(produtoId, quantidade, preco) {
    let pedidoId = localStorage.getItem("pedidoId");

    // Se não houver pedidoId no localStorage, buscar na API
    if (!pedidoId) {
        pedidoId = await buscarPedidoAberto();
        if (pedidoId) {
            localStorage.setItem("pedidoId", pedidoId);
        } else {
            const item = { produtoId, quantidade, precoUnitario: preco };
            pedidoId = await criarNovoPedido([item]);
            localStorage.setItem("pedidoId", pedidoId);
            carregarCarrinho();
            return; // Se não encontrar, não continua com a função
        }
    }

  try {
      const response = await fetch(`${API_BASE_URL}/api/ItensPedido`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
              pedidoId: pedidoId,
              produtoId: produtoId,
              quantidade: quantidade,
              precoUnitario: preco
          })
      });

      if (!response.ok) throw new Error("Erro ao adicionar item ao pedido.");

      let data = null;
      // Verifica se há conteúdo no corpo da resposta
      if (response.headers.get("content-length") > 0) {
          data = await response.json();
      }
      
      // Atualiza o pedidoItens com o novo item adicionado
      pedidoItens[produtoId] = { itemPedidoId: data?.id || null, quantidade: quantidade, preco: preco };

      // Atualiza o carrinho com a nova quantidade e valor total
      quantidadeTotalCarrinho += quantidade;
      valorTotalCarrinho += quantidade * preco;
      await atualizarQuantidadeCarrinho();
      await atualizarValorTotalPedido(pedidoId);

      carregarCarrinho();
      exibirAlerta("Produto adicionado ao carrinho com sucesso!");
  } catch (error) {
      console.error("Erro ao adicionar item ao pedido:", error);
  }
}

// Função para adicionar ou atualizar item no pedido
async function atualizarItemDoPedido(produtoId, novaQuantidade, preco) {
    const pedidoId = localStorage.getItem("pedidoId");
    const itemPedidoId = pedidoItens[produtoId]?.itemPedidoId;
    if (!pedidoId || !itemPedidoId) return;


  try {
      const response = await fetch(`${API_BASE_URL}/api/ItensPedido/${itemPedidoId}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
              pedidoId: pedidoId,
              produtoId: produtoId,
              quantidade: novaQuantidade,
              precoUnitario: preco
          })
      });

      if (!response.ok) throw new Error("Erro ao atualizar item do pedido.");

      pedidoItens[produtoId].quantidade = novaQuantidade;
      
      // Atualiza o carrinho com a nova quantidade e valor total
      quantidadeTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + item.quantidade, 0);
      valorTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + item.quantidade * item.preco, 0);
      await atualizarQuantidadeCarrinho();
      await atualizarValorTotalPedido(pedidoId);
  } catch (error) {
      console.error("Erro ao atualizar item do pedido:", error);
  }
}

async function criarNovoPedido(itens) {
    const pedidoDTO = {
        clienteId: getClienteIdFromToken(),
        dataPedido: new Date().toISOString(),
        status: "Aguardando Processamento",
        itensPedido: itens.map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            preco: item.precoUnitario,
        })),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify(pedidoDTO),
        });

        if (!response.ok) throw new Error("Erro ao criar novo pedido.");
        const pedidoData = await response.json();
        quantidadeTotalCarrinho =+ pedidoData.quantidade;
        await atualizarQuantidadeCarrinho();
        return pedidoData.id;
    } catch (error) {
        console.error("Erro ao criar novo pedido:", error);
        throw error;
    }
}

// Função para carregar o carrinho e exibir produtos adicionados
async function carregarCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho');

    if (!carrinhoDiv) {
        return;
    }

    carrinhoDiv.innerHTML = '';
    let total = 0;

    if (!localStorage.getItem("pedidoId")) {
        carrinhoDiv.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos/${localStorage.getItem("pedidoId")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const pedido = await response.json();
        if (pedido.itemPedido && pedido.itemPedido.$values.length === 0) {
            carrinhoDiv.innerHTML = "<p>Seu carrinho está vazio.</p>";
        } else {
            pedido.itemPedido.$values.forEach(item => {
                total += item.quantidade * item.precoUnitario;
                carrinhoDiv.innerHTML += `
                    <div>
                        <h3>${item.produto.nome}</h3>
                        <p>Quantidade: ${item.quantidade}</p>
                        <p>Preço: R$${item.precoUnitario.toFixed(2)}</p>
                    </div>
                `;
            });
            carrinhoDiv.innerHTML += `<div>Total: R$${total.toFixed(2)}</div>`;
        }
    } catch (error) {
        console.error("Erro ao carregar carrinho:", error);
    }
}

// Função para remover item do pedido
async function removerItemDoPedido(produtoId) {
    const pedidoId = localStorage.getItem("pedidoId");
    const itemPedidoId = pedidoItens[produtoId]?.itemPedidoId;
    if (!pedidoId || !itemPedidoId) return;


    try {
        await fetch(`${API_BASE_URL}/api/ItensPedido/${itemPedidoId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        delete pedidoItens[produtoId];
        quantidadeTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + item.quantidade, 0);
        valorTotalCarrinho = Object.values(pedidoItens).reduce((acc, item) => acc + item.quantidade * item.preco, 0);

        await atualizarQuantidadeCarrinho();
        await atualizarValorTotalPedido(pedidoId);
    } catch (error) {
        console.error("Erro ao remover item do pedido:", error);
    }
}

// Função para atualizar valor total do pedido na API
async function atualizarValorTotalPedido(pedidoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Erro ao obter dados do pedido para atualização.");

        const pedidoAtual = await response.json();

        const pedidoAtualizado = {
            ClienteId: pedidoAtual.clienteId,
            DataPedido: pedidoAtual.dataPedido,
            TotalPedido: valorTotalCarrinho,
            Status: pedidoAtual.status
        };

        const responseUpdate =  await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(pedidoAtualizado)
        });

        if (!responseUpdate.ok) throw new Error("Erro ao atualizar os dados do pedido.");
    } catch (error) {
        console.error("Erro ao atualizar o valor total do pedido:", error);
    }
}

// Função para obter e exibir informações nutricionais
async function obterInformacaoNutricional(produtoId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/InformacoesNutricionais`);
        const dadosNutricionais = await response.json();

        if (dadosNutricionais.$values && Array.isArray(dadosNutricionais.$values)) {
            const info = dadosNutricionais.$values.find((n) => n.produtoId === produtoId);
            const infoDiv = document.getElementById(`info-${produtoId}`);

            if (infoDiv) {
                infoDiv.innerHTML = info
                    ? `<p>Calorias: ${info.calorias}</p><p>Carboidratos: ${info.carboidratos}g</p><p>Proteínas: ${info.proteinas}g</p><p>Gorduras: ${info.gorduras}g</p>`
                    : "<p>Informação nutricional não disponível.</p>";
            }
        }
    } catch (error) {
        console.error("Erro ao obter informações nutricionais:", error);
    }
}

// Função para obter imagem do produto
async function obterImagemProduto(nomeProduto) {
    const caminhoImagemLocal = verificarImagemSimilar(nomeProduto);
    return caminhoImagemLocal || (await buscarImagemUnsplash(nomeProduto));
}

// Função para verificar se há uma imagem local similar
function verificarImagemSimilar(nomeProduto) {
    const nomeFormatado = removerAcentos(nomeProduto.replace(/\s+/g, "").toLowerCase());
    for (const arquivo of arquivosImagens) {
        const arquivoFormatado = removerAcentos(arquivo.replace(/\s+/g, "").toLowerCase());
        if (arquivoFormatado.includes(nomeFormatado)) return `img/${arquivo}`;
    }
    return null;
}

// Função para buscar imagem no Unsplash
async function buscarImagemUnsplash(nomeProduto) {
    const produtoNomeTraduzido = traducoes[nomeProduto.toLowerCase()] || nomeProduto;
    const url = `https://api.unsplash.com/search/photos?query=${produtoNomeTraduzido}&client_id=${unsplashApiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results[0]?.urls?.small || "img/imagem_default.png";
    } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        return "img/imagem_default.png";
    }
}

// Remover acentos de uma string
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Função para exibir um alerta temporário
function exibirAlerta(mensagem) {
    const alertDiv = document.getElementById("alert");
    alertDiv.textContent = mensagem;
    alertDiv.style.display = "block";
    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 3000);
}

function buscarProduto() {
  const termoBusca = document.getElementById("buscaInput").value.toLowerCase();
  const produtosFiltrados = produtos.filter((produto) => produto.nome.toLowerCase().includes(termoBusca));
  exibirProdutos(produtosFiltrados);
}