// Carregar produtos para o dropdown
async function carregarProdutos() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/api/produtos`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar produtos");

        const produtos = await response.json();
        const produtoSelect = document.getElementById("produtoId");

        // Limpa o dropdown antes de adicionar novos itens
        produtoSelect.innerHTML = '<option value="" disabled selected>Selecione um produto</option>';

        produtos.forEach(produto => {
            const option = document.createElement("option");
            option.value = produto.id;
            option.textContent = produto.nome;
            produtoSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar produtos. Tente novamente mais tarde.");
    }
}

// Cadastrar produção
async function cadastrarProducao(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    // Validação básica no frontend
    const produtoId = document.getElementById("produtoId").value;
    const quantidadeProduzida = parseFloat(document.getElementById("quantidadeProduzida").value);
    const dataProducao = new Date(document.getElementById("dataProducao").value);

    if (!produtoId) {
        alert("Selecione um produto.");
        return;
    }

    if (isNaN(quantidadeProduzida) || quantidadeProduzida <= 0) {
        alert("Informe uma quantidade válida e positiva.");
        return;
    }

    if (isNaN(dataProducao.getTime())) {
        alert("Informe uma data de produção válida.");
        return;
    }

    // Formata a data como UTC
    const producaoData = {
        produtoId: parseInt(produtoId, 10),
        quantidadeProduzida,
        dataProducao: dataProducao.toISOString() // Converte a data para UTC
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/producaoCultivo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(producaoData)
        });

        if (!response.ok) throw new Error("Erro ao cadastrar produção");

        alert("Produção cadastrada com sucesso!");
        document.getElementById("cadastroProducaoForm").reset();
    } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar produção. Verifique os dados e tente novamente.");
    }
}

// Event listeners
document.getElementById("cadastroProducaoForm").addEventListener("submit", cadastrarProducao);
document.addEventListener("DOMContentLoaded", carregarProdutos);
