/**
 * SCRIPT PARA O SISTEMA DE IMOBILIÁRIA
 * Gerencia a persistência de dados (localStorage) e a lógica da aplicação.
 */

// --- CONFIGURAÇÕES INICIAIS E DADOS ---

const STORAGE_KEY = 'imobiliaria_properties';
const AUTH_KEY = 'imobiliaria_auth';

// Dados Fictícios Iniciais
const initialData = [
    {
        id: 1,
        title: "Mansão Moderna no Condomínio",
        type: "Casa",
        status: "Venda",
        price: 1500000,
        city: "São Paulo",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
        description: "Uma casa espetacular com piscina privativa, 4 suítes e acabamento de luxo."
    },
    {
        id: 2,
        title: "Apartamento Central Luxo",
        type: "Apartamento",
        status: "Aluguel",
        price: 4500,
        city: "Rio de Janeiro",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        description: "Localização privilegiada, próximo a tudo o que você precisa para o seu dia a dia."
    },
    {
        id: 3,
        title: "Casa de Campo Relaxante",
        type: "Casa",
        status: "Venda",
        price: 850000,
        city: "Gramado",
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
        description: "Ideal para quem busca tranquilidade e contato direto com a natureza."
    }
];

// --- UTILITÁRIOS DE STORAGE ---

const getProperties = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        // Carregamento inicial se o localStorage estiver vazio
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
};

const saveProperties = (properties) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

const checkAuth = () => {
    return localStorage.getItem(AUTH_KEY) === 'true';
};

const setAuth = (status) => {
    localStorage.setItem(AUTH_KEY, status);
};

// --- LÓGICA DA ÁREA PÚBLICA (INDEX.HTML) ---

const initPublicArea = () => {
    const propertyGrid = document.getElementById('property-grid');
    const filterForm = document.getElementById('filter-form');
    const modal = document.getElementById('modal-details');
    const closeModal = document.querySelector('.close-modal');

    if (!propertyGrid) return; // Não está na index.html

    const renderProperties = (filterObj = null) => {
        let properties = getProperties();

        if (filterObj) {
            properties = properties.filter(p => {
                const matchType = filterObj.type === 'all' || p.type === filterObj.type;
                const matchStatus = filterObj.status === 'all' || p.status === filterObj.status;
                const matchCity = !filterObj.city || p.city.toLowerCase().includes(filterObj.city.toLowerCase());
                return matchType && matchStatus && matchCity;
            });
        }

        propertyGrid.innerHTML = '';

        if (properties.length === 0) {
            propertyGrid.innerHTML = '<p class="no-results">Nenhum imóvel encontrado com esses filtros.</p>';
            return;
        }

        properties.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${p.image}" alt="${p.title}" class="card-img">
                <div class="card-content">
                    <p class="card-price">R$ ${p.price.toLocaleString('pt-BR')}</p>
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-info">${p.type} • ${p.status} • ${p.city}</p>
                    <button class="btn-details" onclick="showDetails(${p.id})">Ver Detalhes</button>
                </div>
            `;
            propertyGrid.appendChild(card);
        });
    };

    // Função global para o botão do modal funcionar
    window.showDetails = (id) => {
        const properties = getProperties();
        const p = properties.find(item => item.id === id);

        if (p) {
            const modalBody = document.getElementById('modal-body');
            modalBody.innerHTML = `
                <img src="${p.image}" alt="${p.title}">
                <h1>${p.title}</h1>
                <p class="card-price">R$ ${p.price.toLocaleString('pt-BR')}</p>
                <p class="card-info">${p.type} | ${p.status} | ${p.city}</p>
                <hr style="margin: 20px 0;">
                <p class="modal-desc">${p.description}</p>
                <a href="https://wa.me/5500000000000?text=Olá, tenho interesse no imóvel: ${p.title}" target="_blank" class="btn-whatsapp">
                    Entrar em Contato via WhatsApp
                </a>
            `;
            modal.style.display = 'block';
        }
    };

    // Evento de Filtro
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const filterObj = {
            type: document.getElementById('filter-type').value,
            status: document.getElementById('filter-status').value,
            city: document.getElementById('filter-city').value
        };
        renderProperties(filterObj);
    });

    // Fechar Modal
    if (closeModal) {
        closeModal.onclick = () => modal.style.display = 'none';
    }
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    // Renderizar inicial
    renderProperties();
};

// --- LÓGICA DA ÁREA ADMINISTRATIVA (ADMIN.HTML) ---

const initAdminArea = () => {
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminNav = document.getElementById('admin-nav');
    const loginForm = document.getElementById('login-form');
    const adminTableBody = document.getElementById('admin-table-body');
    const logoutBtn = document.getElementById('logout-btn');
    const openNewModal = document.getElementById('open-modal-new');
    const crudModal = document.getElementById('modal-crud');
    const closeModalCrud = crudModal.querySelector('.close-modal');
    const propertyForm = document.getElementById('property-form');

    if (!loginSection && !adminDashboard) return; // Não está na admin.html

    // Controle de Acesso
    const updateAuthUI = () => {
        if (checkAuth()) {
            loginSection.classList.add('hidden');
            adminDashboard.classList.remove('hidden');
            adminNav.classList.remove('hidden');
        } else {
            loginSection.classList.remove('hidden');
            adminDashboard.classList.add('hidden');
            adminNav.classList.add('hidden');
        }
    };

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;

        if (user === 'admin' && pass === '123') {
            setAuth(true);
            updateAuthUI();
            renderAdminTable();
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setAuth(false);
        updateAuthUI();
    });

    // Renderizar Tabela
    const renderAdminTable = () => {
        const properties = getProperties();
        adminTableBody.innerHTML = '';

        properties.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.title}</td>
                <td>${p.type}</td>
                <td>${p.status}</td>
                <td>R$ ${p.price.toLocaleString('pt-BR')}</td>
                <td>${p.city}</td>
                <td>
                    <button class="btn-primary" onclick="editProperty(${p.id})">Editar</button>
                    <button class="btn-danger" onclick="deleteProperty(${p.id})">Excluir</button>
                </td>
            `;
            adminTableBody.appendChild(tr);
        });
    };

    // Abrir Modal Novo
    openNewModal.addEventListener('click', () => {
        propertyForm.reset();
        document.getElementById('property-id').value = '';
        document.getElementById('modal-title').innerText = 'Cadastrar Imóvel';
        crudModal.style.display = 'block';
    });

    // Fechar Modal CRUD
    closeModalCrud.onclick = () => crudModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == crudModal) crudModal.style.display = 'none';
    };

    // CRUD: Salvar (Criar/Editar)
    propertyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('property-id').value;
        const properties = getProperties();

        const propData = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('prop-title').value,
            type: document.getElementById('prop-type').value,
            status: document.getElementById('prop-status').value,
            price: parseFloat(document.getElementById('prop-price').value),
            city: document.getElementById('prop-city').value,
            image: document.getElementById('prop-image').value,
            description: document.getElementById('prop-description').value
        };

        if (id) {
            // Editar
            const index = properties.findIndex(p => p.id === parseInt(id));
            if (index !== -1) properties[index] = propData;
        } else {
            // Criar
            properties.push(propData);
        }

        saveProperties(properties);
        crudModal.style.display = 'none';
        renderAdminTable();
    });

    // CRUD: Editar (Função Global para o onclick)
    window.editProperty = (id) => {
        const properties = getProperties();
        const p = properties.find(item => item.id === id);

        if (p) {
            document.getElementById('property-id').value = p.id;
            document.getElementById('prop-title').value = p.title;
            document.getElementById('prop-type').value = p.type;
            document.getElementById('prop-status').value = p.status;
            document.getElementById('prop-price').value = p.price;
            document.getElementById('prop-city').value = p.city;
            document.getElementById('prop-image').value = p.image;
            document.getElementById('prop-description').value = p.description;

            document.getElementById('modal-title').innerText = 'Editar Imóvel';
            crudModal.style.display = 'block';
        }
    };

    // CRUD: Excluir (Função Global para o onclick)
    window.deleteProperty = (id) => {
        if (confirm('Tem certeza que deseja excluir este imóvel?')) {
            let properties = getProperties();
            properties = properties.filter(p => p.id !== id);
            saveProperties(properties);
            renderAdminTable();
        }
    };

    // Inicialização da área Admin
    updateAuthUI();
    if (checkAuth()) {
        renderAdminTable();
    }
};

// --- INICIALIZAÇÃO DO SISTEMA ---

// Detecta de qual página o script está sendo executado e inicia a lógica correspondente
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('property-grid')) {
        initPublicArea();
    } else if (document.getElementById('login-section')) {
        initAdminArea();
    }
});
