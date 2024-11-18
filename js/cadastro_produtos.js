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
        const informacaoNutricionalData = {
            calorias: parseInputValue(document.getElementById("calorias").value),
            carboidratos: parseInputValue(document.getElementById("carboidratos").value),
            proteinas: parseInputValue(document.getElementById("proteinas").value),
            gorduras: parseInputValue(document.getElementById("gorduras").value),
            fibras: parseInputValue(document.getElementById("fibras").value),
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

function parseInputValue(value) {
    if (!value) return 0; // Se o valor estiver vazio, retorna 0
    const normalizedValue = value.replace(',', '.'); // Substituir vírgula por ponto
    return parseFloat(normalizedValue) || 0; // Converter para número ou retornar 0
}


document.getElementById("cadastroProdutoForm").addEventListener("submit", cadastrarProduto);
