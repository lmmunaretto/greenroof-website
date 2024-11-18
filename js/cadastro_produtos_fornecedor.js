document.addEventListener("DOMContentLoaded", carregarFornecedores);

// Função para carregar os fornecedores disponíveis no sistema
async function carregarFornecedores() {
    const fornecedorSelect = document.getElementById("fornecedor");
    try {
        const response = await fetch(`${API_BASE_URL}/api/Fornecedores`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        const fornecedores = await response.json();

        fornecedores.forEach(fornecedor => {
            const option = document.createElement("option");
            option.value = fornecedor.id;
            option.textContent = fornecedor.nome;
            fornecedorSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        alert("Erro ao carregar fornecedores.");
    }
}

// Função para cadastrar um novo produto do fornecedor
async function cadastrarProdutoFornecedor(event) {
    event.preventDefault();

    const produtoData = {
        nome: document.getElementById("nomeProduto").value,
        descricao: document.getElementById("descricao").value,
        quantidade: parseInputValue(document.getElementById("quantidade").value),
        preco: parseInputValue(document.getElementById("preco").value),
        tipo: document.getElementById("tipoProduto").value.toLowerCase(),
        fornecedorId: document.getElementById("fornecedor").value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/ProdutosFornecedor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(produtoData)
        });

        if (response.ok) {
            alert("Produto do fornecedor cadastrado com sucesso!");
            document.getElementById("cadastroProdutoFornecedorForm").reset();
        } else {
            const error = await response.json();
            console.error("Erro ao cadastrar produto do fornecedor:", error);
            alert("Erro ao cadastrar produto.");
        }
    } catch (error) {
        console.error("Erro ao cadastrar produto do fornecedor:", error);
        alert("Erro ao cadastrar produto.");
    }
}

// Função para normalizar valores numéricos com vírgula ou ponto
function parseInputValue(value) {
    if (!value) return 0;
    const normalizedValue = value.replace(",", ".");
    return parseFloat(normalizedValue) || 0;
}

document
    .getElementById("cadastroProdutoFornecedorForm")
    .addEventListener("submit", cadastrarProdutoFornecedor);
