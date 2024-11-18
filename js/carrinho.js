let pedidoId = localStorage.getItem("pedidoId");
let pedidoItens = {};

// Função para exibir o carrinho com itens do pedido
async function carregarCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho');
    carrinhoDiv.innerHTML = '';
    let total = 0;

    // Verifica se há um pedidoId no localStorage
    if (!pedidoId) {
        carrinhoDiv.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return; // Para a execução da função caso não haja pedidoId
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!response.ok) throw new Error("Erro ao carregar o pedido.");

        const pedido = await response.json();

        // Exibe o número do pedido no topo
        carrinhoDiv.innerHTML += `<h2>Pedido #${pedido.id}</h2>`;

        // Preenche pedidoItens e exibe os itens no carrinho
        if (!pedido.itemPedido??.length) {
            carrinhoDiv.innerHTML += "<p>Seu carrinho está vazio.</p>";
        } else {
            pedido.itemPedido.forEach((item) => {
                const produtoNome = item.produto?.nome || "Produto desconhecido";
                const precoUnitario = item.precoUnitario || 0;
                const quantidade = item.quantidade || 0;

                pedidoItens[item.produtoId] = {
                    itemPedidoId: item.id,
                    quantidade: quantidade,
                    preco: precoUnitario
                };

                total += precoUnitario * quantidade;

                carrinhoDiv.innerHTML += `
                    <div class="produto-carrinho">
                        <h3>${produtoNome}</h3>
                        <p>Preço: R$${precoUnitario.toFixed(2)}</p>
                        <p>Quantidade: <span id="quantidade-${item.produtoId}">${quantidade}</span></p>
                        <button class="btn btn-danger" onclick="alterarQuantidade(${item.produtoId}, -1, ${precoUnitario})">Remover -1</button>
                        <button class="btn btn-add" onclick="alterarQuantidade(${item.produtoId}, 1, ${precoUnitario})">Adicionar +1</button>
                    </div>
                `;
            });

            carrinhoDiv.innerHTML += `<div class="total">Total: R$${total.toFixed(2)}</div>`;
            carrinhoDiv.innerHTML += `<a href="pagamento.html" class="finalizar">Finalizar Compra</a>`;
        }

        localStorage.setItem('totalCarrinho', total.toFixed(2));
    } catch (error) {
        console.error("Erro ao carregar o carrinho:", error);
        carrinhoDiv.innerHTML = "<p>Erro ao carregar o carrinho.</p>";
    }
}

// Função para alterar quantidade do item no carrinho
async function alterarQuantidade(produtoId, ajuste, preco) {
    const quantidadeElement = document.getElementById(`quantidade-${produtoId}`);
    let quantidadeAtual = parseInt(quantidadeElement.textContent) || 0;
    const novaQuantidade = quantidadeAtual + ajuste;

    if (novaQuantidade <= 0) {
        await removerItemDoPedido(produtoId);
    } else {
        await atualizarItemDoPedido(produtoId, novaQuantidade, preco);
    }

    carregarCarrinho();
}

// Função para atualizar item no pedido
async function atualizarItemDoPedido(produtoId, novaQuantidade, preco) {
    const itemPedidoId = pedidoItens[produtoId]?.itemPedidoId;

    const url = itemPedidoId ? `${API_BASE_URL}/api/ItensPedido/${itemPedidoId}` : `${API_BASE_URL}/api/ItensPedido`;
    const metodo = itemPedidoId ? 'PUT' : 'POST';

    await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ pedidoId, produtoId, quantidade: novaQuantidade, precoUnitario: preco })
    });

    pedidoItens[produtoId] = { itemPedidoId, quantidade: novaQuantidade, preco: preco };
}

// Função para remover item do pedido
async function removerItemDoPedido(produtoId) {
    const itemPedidoId = pedidoItens[produtoId]?.itemPedidoId;
    if (!itemPedidoId) return;

    await fetch(`${API_BASE_URL}/api/ItensPedido/${itemPedidoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    delete pedidoItens[produtoId];
}

// Inicializa o carrinho ao carregar a página
carregarCarrinho();
