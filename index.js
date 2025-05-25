require('dotenv').config();
const express = require('express');
const mercadopago = require('mercadopago');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Nova forma de configurar o SDK do Mercado Pago
const mp = new mercadopago.MercadoPagoConfig({
    accessToken: 'APP_USR-4779116163326490-052423-0033ba78581fe488269d07881150ff28-514128435'
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simulação de banco de dados
const database = {
    orders: new Map(),
    products: [
        {
            id: 1,
            name: "Bebê Sofia",
            price: 449.90,
            description: "Boneca reborn de silicone premium com cabelos naturais"
        },
        {
            id: 2,
            name: "Bebê Lucas e Sofia",
            price: 499.90,
            description: "Conjunto de bonecos reborn em vinil de alta qualidade"
        },
        {
            id: 3,
            name: "Bebê Davi",
            price: 399.90,
            description: "Boneco reborn com corpo em vinil e membros em silicone"
        }
    ]
};

// Rotas da API
app.get('/api/products', (req, res) => {
    res.json(database.products);
});

app.post('/api/create-payment', async (req, res) => {
    try {
        const { productId, customer } = req.body;

        if (!productId || !customer) {
            return res.status(400).json({
                error: 'Dados incompletos',
                message: 'productId e customer são obrigatórios'
            });
        }

        const product = database.products.find(p => p.id == productId);
        if (!product) {
            return res.status(404).json({
                error: 'Produto não encontrado',
                message: 'O ID do produto não existe no catálogo'
            });
        }

        const payer = {
            name: customer.name,
            email: customer.email,
            phone: {
                area_code: customer.phone.substring(0, 2),
                number: customer.phone.substring(2)
            },
            identification: {
                type: customer.document.type || 'CPF',
                number: customer.document.number.replace(/\D/g, '')
            },
            address: {
                zip_code: customer.address.zipCode.replace(/\D/g, ''),
                street_name: customer.address.street,
                street_number: customer.address.number,
                neighborhood: customer.address.neighborhood,
                city: customer.address.city,
                federal_unit: customer.address.state
            }
        };

        const preference = {
            items: [
                {
                    id: product.id,
                    title: product.name,
                    description: product.description,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: product.price
                }
            ],
            payer,
            payment_methods: {
                excluded_payment_types: [
                    { id: 'credit_card' },
                    { id: 'debit_card' },
                    { id: 'ticket' }
                ],
                default_payment_method_id: 'pix',
                installments: 1
            },
            notification_url: `${process.env.BASE_URL || 'http://localhost:' + PORT}/api/payment-notification`,
            external_reference: `order_${Date.now()}`,
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/payment/success`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/payment/pending`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5500'}/payment/failure`
            },
            auto_return: 'approved',
            statement_descriptor: 'BEBESREBORN'
        };

        const response = await mp.preference.create({ body: preference });

        const order = {
            id: response.id,
            status: 'pending',
            product,
            customer,
            created_at: new Date(),
            payment_method: 'pix'
        };

        database.orders.set(response.id, order);

        res.json({
            success: true,
            payment_id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point,
            qr_code: response.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: response.point_of_interaction?.transaction_data?.ticket_url
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({
            error: 'Erro no servidor',
            message: 'Não foi possível processar o pagamento'
        });
    }
});

app.post('/api/payment-notification', async (req, res) => {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).send('ID não fornecido');
        }

        const payment = await mp.payment.get({ id });
        const paymentData = payment;

        if (database.orders.has(paymentData.external_reference)) {
            const order = database.orders.get(paymentData.external_reference);
            order.status = paymentData.status;
            order.updated_at = new Date();
            order.payment_details = {
                status: paymentData.status,
                status_detail: paymentData.status_detail,
                payment_method: paymentData.payment_method_id,
                amount: paymentData.transaction_amount,
                date_approved: paymentData.date_approved
            };

            database.orders.set(paymentData.external_reference, order);

            console.log(`Pedido ${paymentData.external_reference} atualizado: ${paymentData.status}`);
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Erro ao processar notificação');
    }
});

app.get('/api/payment/:id', async (req, res) => {
    try {
        const paymentId = req.params.id;

        if (!database.orders.has(paymentId)) {
            return res.status(404).json({
                error: 'Pedido não encontrado',
                message: 'O ID do pedido não existe em nosso sistema'
            });
        }

        const payment = await mp.payment.get({ id: paymentId });

        res.json({
            status: payment.status,
            status_detail: payment.status_detail,
            payment_method: payment.payment_method_id,
            amount: payment.transaction_amount,
            date_approved: payment.date_approved,
            payer: payment.payer
        });

    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        res.status(500).json({
            error: 'Erro no servidor',
            message: 'Não foi possível verificar o pagamento'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`URL Base: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
});
