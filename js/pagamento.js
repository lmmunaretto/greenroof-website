const pedidoId = localStorage.getItem("pedidoId");

async function carregarDadosPagamento() {
    if (pedidoId) {
        document.getElementById("pedido-id").value = pedidoId;

        const response = await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}`);
        const pedido = await response.json();

        document.getElementById("valor-pagamento").value = pedido.totalPedido.toFixed(2);
    }
}

async function concluirPagamento() {
    const metodoPagamento = document.getElementById("metodo-pagamento").value;
    const valorPagamento = parseFloat(document.getElementById("valor-pagamento").value);
    const dataPagamento = new Date().toISOString();
    const statusPagamento = "Concluído";

    const pagamentoData = {
        pedidoId: pedidoId,
        metodoPagamento: metodoPagamento,
        valorPagamento: valorPagamento,
        dataPagamento: dataPagamento,
        statusPagamento: statusPagamento
    };

    const response = await fetch(`${API_BASE_URL}/api/Pagamentos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(pagamentoData)
    });

    if (response.ok) {
        alert("Pagamento concluído com sucesso!");
        await atualizarStatusPedido();
        await atualizarEstoqueProdutos(pedidoId);
        voltarParaCarrinho();
    } else {
        alert("Erro ao processar pagamento.");
    }
}

async function atualizarStatusPedido() {
    const statusData = JSON.stringify("Concluído");

    await fetch(`${API_BASE_URL}/api/Pedidos/${pedidoId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: statusData
    });
}

async function atualizarEstoqueProdutos(pedidoId) {
    const token = localStorage.getItem("token");

    try {
        // Obtém os itens do pedido para atualizar o estoque dos produtos
        const response = await fetch(`${API_BASE_URL}/api/Pedidos/all/${pedidoId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Erro ao carregar itens do pedido para atualizar estoque.");
        }

        const pedido = await response.json();

        // Atualiza a quantidade de cada produto com base nos itens do pedido
        for (const item of pedido.itemPedido) {
            await atualizarProduto(item.produtoId, item.quantidade);
        }
    } catch (error) {
        console.error("Erro ao atualizar estoque dos produtos:", error);
    }
}

async function atualizarProduto(produtoId, quantidadeComprada) {
    const token = localStorage.getItem("token");

    try {
        // Obtém o produto pelo ID para atualizar sua quantidade
        const response = await fetch(`${API_BASE_URL}/api/Produtos/${produtoId}`, {
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Erro ao obter produto ${produtoId} para atualização.`);
        }

        const produto = await response.json();

        // Calcula a nova quantidade, subtraindo a quantidade comprada
        const novaQuantidade = Math.max(0, produto.quantidade - quantidadeComprada); // Garante que não fique negativo

        // Atualiza o produto com a nova quantidade
        await fetch(`${API_BASE_URL}/api/Produtos/${produtoId}/estoque`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(novaQuantidade)
        });

    } catch (error) {
        console.error(`Erro ao atualizar quantidade do produto ${produtoId}:`, error);
    }
}


function voltarParaCarrinho() {
    limparLocalStorage();
    window.location.href = 'produtos.html';
}

carregarDadosPagamento();

function limparLocalStorage() {
    // Armazena temporariamente os valores de role e token
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    // Limpa todo o localStorage
    localStorage.clear();

    // Restaura role e token
    if (role) localStorage.setItem("role", role);
    if (token) localStorage.setItem("token", token);
}