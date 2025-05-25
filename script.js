// Configuração do Mercado Pago
const mp = new MercadoPago('APP_USR-7a42ca8c-ff07-42ce-a665-d6bc439e3fda', {
    locale: 'pt-BR'
});

// Dados dos produtos (mantido igual)
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
    // ... (mantenha os outros produtos)
];

// Elementos do DOM (mantido igual)
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

// Variáveis globais (mantido igual)
let currentBannerIndex = 0;
let currentProductIndex = 0;
let selectedProduct = produtos[0];
let preferenceId = null;

// Função para criar preferência de pagamento (ATUALIZADA)
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
                        { id: 'ticket' }
                    ],
                    default_payment_method_id: 'pix',
                    installments: 1
                },
                notification_url: 'https://seusite.com.br/webhook',
                statement_descriptor: 'BEBESREBORN',
                external_reference: 'order_' + Date.now(),
                back_urls: {
                    success: window.location.href,
                    pending: window.location.href,
                    failure: window.location.href
                },
                auto_return: 'approved',
                point_of_interaction: {
                    type: 'PIX'
                }
            })
        });

        const data = await response.json();
        return data.id;
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        throw error;
    }
}

// Função para inicializar pagamento PIX (ATUALIZADA)
async function initPixPayment(preferenceId) {
    try {
        // Obtém os dados da preferência
        const preferenceResponse = await fetch(`https://api.mercadopago.com/checkout/preferences/${preferenceId}`, {
            headers: {
                'Authorization': 'Bearer APP_USR-4779116163326490-052423-0033ba78581fe488269d07881150ff28-514128435'
            }
        });
        
        const preferenceData = await preferenceResponse.json();
        
        // Verifica se temos os dados do PIX
        if (preferenceData.point_of_interaction && 
            preferenceData.point_of_interaction.transaction_data &&
            preferenceData.point_of_interaction.transaction_data.qr_code_base64) {
            
            // Cria o QR Code a partir da imagem base64
            const qrCodeImg = document.createElement('img');
            qrCodeImg.src = `data:image/png;base64,${preferenceData.point_of_interaction.transaction_data.qr_code_base64}`;
            qrCodeImg.alt = "QR Code PIX";
            qrCodeImg.style.maxWidth = '100%';
            qrCodeImg.style.height = 'auto';
            
            // Limpa o container e adiciona o QR Code
            qrCodeContainer.innerHTML = '';
            qrCodeContainer.appendChild(qrCodeImg);
            
            // Define o código PIX para copiar
            codigoPix.textContent = preferenceData.point_of_interaction.transaction_data.qr_code;
        } else {
            throw new Error('Dados do PIX não encontrados na resposta');
        }
    } catch (error) {
        console.error('Erro ao obter dados do PIX:', error);
        
        // Fallback: Exibe mensagem de erro
        qrCodeContainer.innerHTML = `
            <div class="pix-error">
                <p>Não foi possível gerar o QR Code automaticamente.</p>
                <button id="btn-refresh-pix" class="btn">Tentar Novamente</button>
            </div>
        `;
        
        document.getElementById('btn-refresh-pix').addEventListener('click', () => {
            initPixPayment(preferenceId);
        });
        
        // Código PIX fallback
        codigoPix.textContent = '00020126580014BR.GOV.BCB.PIX0136123e4567-e12b-12d1-a456-4266554400005204000053039865405' + 
                              selectedProduct.precoPromo.toFixed(2) + '5802BR5913LOJADOBEBE6008SAOPAULO61080540900062200516RP' + 
                              Math.random().toString(36).substring(2, 10) + '6304' + 
                              Math.random().toString(36).substring(2, 6).toUpperCase();
    }
}

// Mantenha todas as outras funções exatamente como estão:
// - carregarProdutos()
// - rotateBanners()
// - updateCarrossel()
// - abrirModalDados()
// - fecharModal()
// - buscarCEP()
// - formatarCPF()
// - formatarTelefone()
// - formatarCEP()
// - copiarCodigoPix()

// Event Listeners (mantido igual)
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    
    if (banners.length > 1) {
        setInterval(rotateBanners, 5000);
    }
    
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
    
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', fecharModal);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modalDados || e.target === modalPagamento) {
            fecharModal();
        }
    });
    
    formDados.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        produtoNome.textContent = selectedProduct.nome;
        produtoPreco.textContent = 'R$ ' + selectedProduct.precoPromo.toFixed(2);
        produtoTotal.textContent = 'R$ ' + selectedProduct.precoPromo.toFixed(2);
        
        try {
            preferenceId = await criarPreferencia();
            
            modalDados.style.display = 'none';
            modalPagamento.style.display = 'block';
            
            initPixPayment(preferenceId);
        } catch (error) {
            alert('Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.');
            console.error(error);
        }
    });
    
    document.getElementById('cpf').addEventListener('input', (e) => {
        e.target.value = formatarCPF(e.target.value);
    });
    
    document.getElementById('telefone').addEventListener('input', (e) => {
        e.target.value = formatarTelefone(e.target.value);
    });
    
    document.getElementById('cep').addEventListener('input', (e) => {
        e.target.value = formatarCEP(e.target.value);
        
        if (e.target.value.replace(/\D/g, '').length === 8) {
            buscarCEP();
        }
    });
    
    btnCopiarPix.addEventListener('click', copiarCodigoPix);
    
    document.addEventListener('gesturestart', function(e) {
        e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) { e.preventDefault(); }
    }, { passive: false });
});
