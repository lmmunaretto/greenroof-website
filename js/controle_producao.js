let producoes = [];
let currentPage = 1;
const itemsPerPage = 4;

// Carregar produções do servidor
async function carregarProducoes() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_BASE_URL}/api/producaoCultivo`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Erro ao carregar produções");

        producoes = await response.json();
        carregarProducao(); // Atualiza a lista com filtros aplicados
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar produções. Tente novamente mais tarde.");
    }
}

// Aplicar filtros (Ano, Mês e Dia)
function carregarProducao() {
    const filtroAno = document.getElementById("filtroAno").value;
    const filtroMes = document.getElementById("filtroMes").value;
    const filtroDia = document.getElementById("filtroDia").value;

    let producaoFiltrada = producoes;

    // Filtro por ano
    if (filtroAno) {
        producaoFiltrada = producaoFiltrada.filter(producao =>
            new Date(producao.dataProducao).getFullYear() == filtroAno
        );
    }

    // Filtro por mês
    if (filtroMes) {
        producaoFiltrada = producaoFiltrada.filter(producao =>
            new Date(producao.dataProducao).getMonth() + 1 == filtroMes
        );
    }

    // Filtro por dia
    if (filtroDia) {
        producaoFiltrada = producaoFiltrada.filter(producao =>
            new Date(producao.dataProducao).toISOString().split("T")[0] === filtroDia
        );
    }

    renderizarPagina(currentPage, producaoFiltrada);
}

// Renderizar a lista de produções
function renderizarPagina(pageNumber, producaoFiltrada) {
    const producaoList = document.getElementById("producaoList");
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const producoesPagina = producaoFiltrada.slice(startIndex, endIndex);

    producaoList.innerHTML = producoesPagina.map(producao => `
        <div class="card producao-item">
            <h3>Produto: ${producao.produtoNome}</h3>
            <p>Data: ${new Date(producao.dataProducao).toLocaleDateString()}</p>
            <p>Quantidade Produzida: ${producao.quantidadeProduzida}</p>
        </div>
    `).join("");

    updatePaginationControls(producaoFiltrada.length);
}

// Atualizar controles de paginação
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById("pageInfo").innerText = `Página ${currentPage} de ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage <= 1;
    document.getElementById("nextPage").disabled = currentPage >= totalPages;
}

// Navegação entre páginas
function changePage(direction) {
    const totalPages = Math.ceil(producoes.length / itemsPerPage);
    currentPage = Math.min(Math.max(1, currentPage + direction), totalPages);
    carregarProducao();
}

// Popula os filtros de ano dinamicamente
function popularFiltroAno() {
    const filtroAno = document.getElementById("filtroAno");
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= anoAtual - 10; ano--) {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        filtroAno.appendChild(option);
    }
}

// Inicializa os filtros e carrega as produções ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    popularFiltroAno();
    carregarProducoes();
});
