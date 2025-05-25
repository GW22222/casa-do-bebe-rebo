// Configuração do Mercado Pago
const mp = new MercadoPago('APP_USR-7a42ca8c-ff07-42ce-a665-d6bc439e3fda', {
    locale: 'pt-BR'
});

// Dados dos produtos
const produtos = [
    {
        id: 1,
        nome: "Bebê Sofia",
        imagens: [
            "assets/images/bebes/sofia1.jpg",
            "assets/images/bebes/sofia2.jpg",
            "assets/images/bebes/sofia3.jpg"
        ],
        tamanho: "45cm",
        materiais: "Silicone premium e cabelos naturais",
        precoOriginal: 899.90,
        precoPromo: 449.90
    },
    {
        id: 2,
        nome: "Bebê Lucas e Sofia",
        imagens: [
            "assets/images/bebes/lucas1-esofia1.jpg",
            "assets/images/bebes/lucas2-esofia2.jpg",
            "assets/images/bebes/lucas3-esofia3.jpg"
        ],
        tamanho: "50cm",
        materiais: "Vinil de alta qualidade e cabelos implantados",
        precoOriginal: 999.90,
        precoPromo: 499.90
    },
    {
        id: 3,
        nome: "Bebê Davi",
        imagens: [
            "assets/images/bebes/davi1.jpg",
            "assets/images/bebes/davi2.jpg",
            "assets/images/bebes/davi3.jpg"
        ],
        tamanho: "40cm",
        materiais: "Corpo em vinil e membros em silicone",
        precoOriginal: 799.90,
        precoPromo: 399.90
    },
    {
        id: 4,
        nome: "Bebê Sara",
        imagens: [
            "assets/images/bebes/sara1.jpg",
            "assets/images/bebes/sara2.jpg",
            "assets/images/bebes/sara3.jpg"
        ],
        tamanho: "40cm",
        materiais: "Corpo em vinil e membros em silicone",
        precoOriginal: 799.90,
        precoPromo: 399.90
    },
    {
        id: 5,
        nome: "Bebê Fernanda",
        imagens: [
            "assets/images/bebes/fernanda1.jpg",
            "assets/images/bebes/fernanda2.jpg",
            "assets/images/bebes/fernanda3.jpg"
        ],
        tamanho: "40cm",
        materiais: "Corpo em vinil e membros em silicone",
        precoOriginal: 799.90,
        precoPromo: 399.90
    }
];

// Elementos do DOM
const produtosContainer = document.getElementById('produtos-container');
const btnComprarDestaque = document.getElementById('btn-comprar-destaque');
const btnComprarRodape = document.getElementById('btn-comprar-rodape');
const modalDados = document.getElementById('modal-dados');
const modalPagamento = document.getElementById('modal-pagamento');
const formDados = document.getElementById('form-dados');
const btnCopiarPix = document.getElementById('btn-copiar-pix');
const codigoPix = document.getElementById('codigo-pix');
const qrCodeContainer = document.getElementById('qr-code-container');
const closeModalButtons = document.querySelectorAll('.close-modal');
const produtoNome = document.getElementById('produto-nome');
const produtoPreco = document.getElementById('produto-preco');
const produtoTotal = document.getElementById('produto-total');
const banners = document.querySelectorAll('.banner');
const carrosselContainer = document.querySelector('.carrossel-container');
const prevBtn = document.querySelector('.carrossel-btn.prev');
const nextBtn = document.querySelector('.carrossel-btn.next');

// Variáveis globais
let currentBannerIndex = 0;
let currentProductIndex = 0;
let selectedProduct = produtos[0];
let preferenceId = null;

// Carrega os produtos na página
function carregarProdutos() {
    produtosContainer.innerHTML = '';
    
    produtos.forEach((produto, index) => {
        // Gera os botões do mini-carrossel
        const dots = produto.imagens.map((_, i) => 
            `<button class="mini-carrossel-btn ${i === 0 ? 'active' : ''}" data-index="${i}"></button>`
        ).join('');
        
        // Gera as imagens do mini-carrossel
        const images = produto.imagens.map(img => 
            `<img src="${img}" alt="${produto.nome}" class="mini-carrossel-img" loading="lazy">`
        ).join('');
        
        const produtoHTML = `
            <div class="card-produto" data-index="${index}">
                <div class="mini-carrossel">
                    <div class="mini-carrossel-container" id="mini-carrossel-${produto.id}">
                        ${images}
                    </div>
                    <div class="mini-carrossel-btns">
                        ${dots}
                    </div>
                </div>
                <div class="card-info">
                    <h3>${produto.nome}</h3>
                    <p class="tamanho">Tamanho: ${produto.tamanho}</p>
                    <p class="materiais">${produto.materiais}</p>
                    <div class="preco">
                        <span class="preco-original">De: R$ ${produto.precoOriginal.toFixed(2)}</span>
                        <span class="preco-promo">Por: R$ ${produto.precoPromo.toFixed(2)}</span>
                    </div>
                    <button class="btn btn-comprar" data-id="${produto.id}">Comprar Agora</button>
                </div>
            </div>
        `;
        
        produtosContainer.innerHTML += produtoHTML;
    });
    
    // Adiciona eventos aos botões de compra
    document.querySelectorAll('.btn-comprar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = parseInt(btn.getAttribute('data-id'));
            selectedProduct = produtos.find(p => p.id === productId);
            abrirModalDados();
        });
    });
    
    // Inicializa os mini-carrosseis
    produtos.forEach(produto => {
        const container = document.getElementById(`mini-carrossel-${produto.id}`);
        const buttons = container.parentElement.querySelectorAll('.mini-carrossel-btn');
        let currentImgIndex = 0;
        
        // Adiciona eventos aos botões do mini-carrossel
        buttons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.style.transform = `translateX(-${index * 100}%)`;
                currentImgIndex = index;
            });
        });
        
        // Rotação automática das imagens
        if (produto.imagens.length > 1) {
            setInterval(() => {
                currentImgIndex = (currentImgIndex + 1) % produto.imagens.length;
                container.style.transform = `translateX(-${currentImgIndex * 100}%)`;
                buttons.forEach(b => b.classList.remove('active'));
                buttons[currentImgIndex].classList.add('active');
            }, 3000);
        }
    });
}

// Rotação dos banners
function rotateBanners() {
    banners[currentBannerIndex].classList.remove('active');
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    banners[currentBannerIndex].classList.add('active');
}

// Controle do carrossel de produtos
function updateCarrossel() {
    const cardWidth = document.querySelector('.card-produto').offsetWidth + 20;
    carrosselContainer.style.transform = `translateX(-${currentProductIndex * cardWidth}px)`;
}

// Abre o modal de dados
function abrirModalDados() {
    modalDados.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fecha o modal
function fecharModal() {
    modalDados.style.display = 'none';
    modalPagamento.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Valida o CEP
function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) return;
    
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (!data.erro) {
                document.getElementById('endereco').value = data.logradouro;
                document.getElementById('bairro').value = data.bairro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            }
        })
        .catch(error => console.error('Erro ao buscar CEP:', error));
}

// Formata o CPF
function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return cpf;
}

// Formata o telefone
function formatarTelefone(telefone) {
    telefone = telefone.replace(/\D/g, '');
    
    if (telefone.length <= 10) {
        telefone = telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
        telefone = telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
}

// Formata o CEP
function formatarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    return cep;
}

// Copia o código Pix
function copiarCodigoPix() {
    navigator.clipboard.writeText(codigoPix.textContent)
        .then(() => {
            btnCopiarPix.textContent = 'Código Copiado!';
            setTimeout(() => {
                btnCopiarPix.textContent = 'Copiar Código';
            }, 2000);
        })
        .catch(err => console.error('Erro ao copiar código:', err));
}

// Cria a preferência de pagamento no Mercado Pago
async function criarPreferencia() {
    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer APP_USR-4779116163326490-052423-0033ba78581fe488269d07881150ff28-514128435'
            },
            body: JSON.stringify({
                items: [
                    {
                        title: selectedProduct.nome,
                        quantity: 1,
                        unit_price: selectedProduct.precoPromo,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: document.getElementById('nome').value,
                    email: document.getElementById('email').value,
                    phone: {
                        number: document.getElementById('telefone').value.replace(/\D/g, '')
                    },
                    identification: {
                        type: 'CPF',
                        number: document.getElementById('cpf').value.replace(/\D/g, '')
                    },
                    address: {
                        zip_code: document.getElementById('cep').value.replace(/\D/g, ''),
                        street_name: document.getElementById('endereco').value,
                        street_number: document.getElementById('numero').value,
                        neighborhood: document.getElementById('bairro').value,
                        city: document.getElementById('cidade').value,
                        federal_unit: document.getElementById('estado').value
                    }
                },
                payment_methods: {
                    excluded_payment_types: [
                        { id: 'credit_card' },
                        { id: 'debit_card' },
                        { id: 'ticket' },
                        { id: 'atm' }
                    ],
                    default_payment_method_id: 'pix',
                    installments: 1
                },
                notification_url: 'https://webhook.site/your-webhook',
                statement_descriptor: 'BEBESREBORN',
                external_reference: 'order_' + Date.now(),
                back_urls: {
                    success: window.location.href,
                    pending: window.location.href,
                    failure: window.location.href
                },
                auto_return: 'approved'
            })
        });

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        throw error;
    }
}

// Inicializa o QR Code do Pix
async function initPixPayment(preferenceId) {
    const bricksBuilder = await mp.bricks();
    
    bricksBuilder.create('wallet', 'qr-code-container', {
        initialization: {
            preferenceId: preferenceId
        },
        customization: {
            visual: {
                style: {
                    theme: 'dark'
                }
            }
        }
    });
    
    // Obtém o código Pix real da API
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${preferenceId}`, {
            headers: {
                'Authorization': 'Bearer APP_USR-4779116163326490-052423-0033ba78581fe488269d07881150ff28-514128435'
            }
        });
        const paymentData = await response.json();
        
        if (paymentData.point_of_interaction && paymentData.point_of_interaction.transaction_data) {
            codigoPix.textContent = paymentData.point_of_interaction.transaction_data.qr_code;
        } else {
            codigoPix.textContent = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865405' + 
                                  selectedProduct.precoPromo.toFixed(2) + '5802BR5913LOJADOBEBE6008SAOPAULO61080540900062200516RP' + 
                                  Math.random().toString(36).substring(2, 10) + '6304' + 
                                  Math.random().toString(36).substring(2, 6).toUpperCase();
        }
    } catch (error) {
        console.error('Erro ao obter código Pix:', error);
        codigoPix.textContent = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865405' + 
                              selectedProduct.precoPromo.toFixed(2) + '5802BR5913LOJADOBEBE6008SAOPAULO61080540900062200516RP' + 
                              Math.random().toString(36).substring(2, 10) + '6304' + 
                              Math.random().toString(36).substring(2, 6).toUpperCase();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    
    // Rotação automática dos banners
    if (banners.length > 1) {
        setInterval(rotateBanners, 5000);
    }
    
    // Controles do carrossel
    prevBtn.addEventListener('click', () => {
        if (currentProductIndex > 0) {
            currentProductIndex--;
            updateCarrossel();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentProductIndex < produtos.length - 1) {
            currentProductIndex++;
            updateCarrossel();
        }
    });
    
    // Botões que abrem o modal
    btnComprarDestaque.addEventListener('click', (e) => {
        e.preventDefault();
        selectedProduct = produtos[0];
        abrirModalDados();
    });
    
    btnComprarRodape.addEventListener('click', (e) => {
        e.preventDefault();
        selectedProduct = produtos[0];
        abrirModalDados();
    });
    
    // Fechar modais
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', fecharModal);
    });
    
    // Clicar fora do modal fecha
    window.addEventListener('click', (e) => {
        if (e.target === modalDados || e.target === modalPagamento) {
            fecharModal();
        }
    });
    
    // Formulário de dados
    formDados.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Atualiza o resumo do pedido
        produtoNome.textContent = selectedProduct.nome;
        produtoPreco.textContent = 'R$ ' + selectedProduct.precoPromo.toFixed(2);
        produtoTotal.textContent = 'R$ ' + selectedProduct.precoPromo.toFixed(2);
        
        try {
            // Cria a preferência de pagamento
            preferenceId = await criarPreferencia();
            
            // Mostra o modal de pagamento
            modalDados.style.display = 'none';
            modalPagamento.style.display = 'block';
            
            // Inicializa o pagamento com Pix
            initPixPayment(preferenceId);
        } catch (error) {
            alert('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
            console.error(error);
        }
    });
    
    // Formatação de campos
    document.getElementById('cpf').addEventListener('input', (e) => {
        e.target.value = formatarCPF(e.target.value);
    });
    
    document.getElementById('telefone').addEventListener('input', (e) => {
        e.target.value = formatarTelefone(e.target.value);
    });
    
    document.getElementById('cep').addEventListener('input', (e) => {
        e.target.value = formatarCEP(e.target.value);
        
        // Quando o CEP estiver completo, busca os dados
        if (e.target.value.replace(/\D/g, '').length === 8) {
            buscarCEP();
        }
    });
    
    // Copiar código Pix
    btnCopiarPix.addEventListener('click', copiarCodigoPix);
    
    // Previne zoom em dispositivos móveis
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });
});