window.API_BASE_URL = window.API_BASE_URL || "https://greenroofapi-production.up.railway.app";
window.UNSPLASH_API_KEY = window.UNSPLASH_API_KEY || "kUg4WZZWtRDakNeUEnfwTlm7Rdb8wbz-Jc_3cF23vXM";
window.LOCALIZATION_API_KEY = window.LOCALIZATION_API_KEY || "5db5a96f174d46e389853c0ec12d44a2";


document.addEventListener("DOMContentLoaded", () => {
    const fabMenu = document.getElementById("fabMenu");
    const fabButton = document.querySelector(".fab-button");
    const fabOptions = document.querySelector(".fab-options");
    const role = localStorage.getItem("role");

    // Função para atualizar o contador de itens do carrinho
    function updateCartCount() {
        const qtdCarrinho = localStorage.getItem("quantidadeTotalCarrinho") || "0";
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) {
            cartCountElement.textContent = `(${qtdCarrinho})`;
        }
    }

    // Verifica se a página atual é de Login ou Troca de Senha
    const isAuthPage = window.location.pathname.includes("login.html") || window.location.pathname.includes("trocar_senha.html");
    if (isAuthPage) {
        fabMenu.style.display = "none";
        return;
    }

    const currentPage = window.location.pathname.split("/").pop();

    // Links do menu com restrições de visualização por role
    const links = [
        { label: "Cadastro de Clientes", url: "cadastro_cliente.html", roles: ["Admin"] },
        { label: "Cadastro de Fornecedores", url: "cadastro_fornecedor.html", roles: ["Admin"] },
        { label: "Cadastro de Produtos", url: "cadastro_produtos.html", roles: ["Admin"] },
        { label: "Clientes", url: "clientes.html", roles: ["Admin"] },
        { label: "Fornecedores", url: "fornecedor.html", roles: ["Admin"] },
        { label: "Controle de Vendas", url: "controle_vendas.html", roles: ["Admin"] },
        { label: "Sugestões de Cultivo", url: "sugestoes_cultivo.html", roles: ["Admin"] },
        { label: "Carrinho", url: "carrinho.html", roles: ["Cliente"] },
        { label: "Pagamento", url: "pagamento.html", roles: ["Cliente"] },
        { label: "Produtos", url: "produtos.html", roles: ["Admin", "Cliente"] },
    ];

    // Popula o menu com base no role e adiciona o contador ao link do Carrinho para o Cliente
    links.forEach(link => {
        if (link.roles.includes(role) && link.url !== currentPage) {
            const option = document.createElement("a");
            option.href = link.url;
            option.textContent = link.label;

            // Adiciona o contador de itens apenas ao link do Carrinho para o Cliente
            if (link.label === "Carrinho" && role === "Cliente" && !document.getElementById("cart-count")) {
                const cartCountSpan = document.createElement("span");
                cartCountSpan.id = "cart-count";
                cartCountSpan.textContent = `(${localStorage.getItem("quantidadeTotalCarrinho") || "0"})`;
                option.appendChild(cartCountSpan);
            }

            fabOptions.appendChild(option);
        }
    });

    // Atualiza o contador ao carregar a página
    if (role === "Cliente") {
        updateCartCount();
    }

    // Adiciona o botão de logout no menu FAB
    const logoutOption = document.createElement("a");
    logoutOption.textContent = "Logout";
    logoutOption.href = "#";
    logoutOption.classList.add("logout-button");
    logoutOption.onclick = (e) => {
        e.preventDefault();
        realizarLogout();
    };
    fabOptions.appendChild(logoutOption);

    // Função de logout
    function realizarLogout() {
        localStorage.clear();
        window.location.href = "login.html";
    }

    // Alternância de exibição do menu ao clicar no FAB button
    fabButton.addEventListener("click", () => {
        fabOptions.classList.toggle("show");
    });

    // Oculta o menu ao clicar fora dele
    document.addEventListener("click", (e) => {
        if (!fabMenu.contains(e.target)) {
            fabOptions.classList.remove("show");
        }
    });

    // Monitora o localStorage para atualizações no contador de itens
    if (role === "Cliente") {
        window.addEventListener("storage", (event) => {
            if (event.key === "quantidadeTotalCarrinho") {
                updateCartCount();
            }
        });
    }
});
