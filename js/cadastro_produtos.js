// Função para carregar fornecedores e preencher o select
async function carregarFornecedores() {
    const response = await fetch(`${API_BASE_URL}/api/fornecedores`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    });

    const fornecedoresResponse = await response.json();
    const fornecedores = fornecedoresResponse.$values;
    const fornecedorSelect = document.getElementById("fornecedorSelect");

    fornecedores.forEach(fornecedor => {
        const option = document.createElement("option");
        option.value = fornecedor.id;
        option.textContent = fornecedor.nome;
        fornecedorSelect.appendChild(option);
    });
}

// Função para cadastrar um novo produto
async function cadastrarProduto(event) {
    event.preventDefault();

    // Dados do produto
    const produtoData = {
        nome: document.getElementById("nomeProduto").value,
        descricao: document.getElementById("descricao").value,
        quantidade: document.getElementById("quantidade").value,
        limiteMinimoEstoque: document.getElementById("limiteMinimoEstoque").value,
        preco: document.getElementById("preco").value,
        tipo: document.getElementById("tipoProduto").value.toLowerCase(),
        fornecedorId: document.getElementById("fornecedorSelect").value
    };

    // Cadastro do produto
    const produtoResponse = await fetch(`${API_BASE_URL}/api/produtos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(produtoData)
    });

    const produto = await produtoResponse.json();

    if (produtoResponse.ok) {
        // Dados das informações nutricionais
        const informacaoNutricionalData = {
            calorias: document.getElementById("calorias").value,
            carboidratos: document.getElementById("carboidratos").value,
            proteinas: document.getElementById("proteinas").value,
            gorduras: document.getElementById("gorduras").value,
            fibras: document.getElementById("fibras").value,
            produtoId: produto.id  // Associando ao produto recém-criado
        };

        // Cadastro das informações nutricionais
        const nutricionalResponse = await fetch(`${API_BASE_URL}/api/InformacoesNutricionais`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(informacaoNutricionalData)
        });

        if (nutricionalResponse.ok) {
            alert("Produto e informações nutricionais cadastrados com sucesso!");
            document.getElementById("cadastroProdutoForm").reset();
        } else {
            alert("Erro ao cadastrar informações nutricionais.");
        }
    } else {
        alert("Erro ao cadastrar produto.");
    }
}

document.getElementById("cadastroProdutoForm").addEventListener("submit", cadastrarProduto);
document.addEventListener("DOMContentLoaded", () => {
    carregarFornecedores();
});
