const STORAGE_KEY = 'imobiliaria_properties';
const AUTH_KEY = 'imobiliaria_auth';

const initialData = [
    {
        id: 1,
        title: "Mansão Moderna no Condomínio",
        type: "Casa",
        status: "Venda",
        price: 1500000,
        city: "São Paulo",
        images: [
            "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Uma casa espetacular com piscina privativa, 4 suítes e acabamento de luxo."
    },
    {
        id: 2,
        title: "Apartamento Central Luxo",
        type: "Apartamento",
        status: "Aluguel",
        price: 4500,
        city: "Rio de Janeiro",
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Localização privilegiada, próximo a tudo o que você precisa para o seu dia a dia."
    },
    {
        id: 3,
        title: "Casa de Campo Relaxante",
        type: "Casa",
        status: "Venda",
        price: 850000,
        city: "Gramado",
        images: [
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
        ],
        description: "Ideal para quem busca tranquilidade e contato direto com a natureza."
    }
];

const getProperties = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
};

const saveProperties = (properties) => localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
const checkAuth = () => localStorage.getItem(AUTH_KEY) === 'true';
const setAuth = (status) => localStorage.setItem(AUTH_KEY, status);
const formatPrice = (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`;
const getImagesArray = (prop) => prop.images && prop.images.length ? prop.images : [prop.image].filter(Boolean);

const initPublicArea = () => {
    const propertyGrid = document.getElementById('property-grid');
    const filterForm = document.getElementById('filter-form');
    const modal = document.getElementById('modal-details');
    const closeModal = document.querySelector('#modal-details .close-modal');
    const resultsCount = document.getElementById('results-count');
    if (!propertyGrid) return;

    const renderProperties = (filterObj = null) => {
        let properties = getProperties();
        if (filterObj) {
            properties = properties.filter(p => {
                const matchType = filterObj.type === 'all' || p.type === filterObj.type;
                const matchStatus = filterObj.status === 'all' || p.status === filterObj.status;
                const matchCity = !filterObj.city || p.city.toLowerCase().includes(filterObj.city.toLowerCase());
                const matchPrice = !filterObj.price || p.price <= parseFloat(filterObj.price);
                return matchType && matchStatus && matchCity && matchPrice;
            });
        }
        propertyGrid.innerHTML = '';
        if (resultsCount) resultsCount.textContent = `${properties.length} imóvel(is) encontrado(s)`;
        if (properties.length === 0) {
            propertyGrid.innerHTML = '<p class="no-results">Nenhum imóvel encontrado com esses filtros.</p>';
            return;
        }
        properties.forEach(p => {
            const images = getImagesArray(p);
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${images[0]}" alt="${p.title}" class="card-img">
                    <span class="card-badge">${p.status}</span>
                </div>
                <div class="card-content">
                    <p class="card-price">${formatPrice(p.price)}</p>
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-info">${p.type} • ${p.city}</p>
                    <button class="btn-details" onclick="showDetails(${p.id})">Ver Detalhes</button>
                </div>
            `;
            propertyGrid.appendChild(card);
        });
    };

    window.showDetails = (id) => {
        const p = getProperties().find(item => item.id === id);
        if (!p) return;
        const images = getImagesArray(p);
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="details-gallery">
                <img src="${images[0]}" alt="${p.title}" class="main-detail-image">
                <div class="thumbnail-row">
                    ${images.slice(0,5).map(img => `<img src="${img}" class="thumb" alt="foto do imóvel">`).join('')}
                </div>
            </div>
            <div class="details-info">
                <div class="details-top">
                    <h1>${p.title}</h1>
                    <p class="card-price">${formatPrice(p.price)}</p>
                </div>
                <p class="card-info">${p.type} | ${p.status} | ${p.city}</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p class="modal-desc">${p.description}</p>
                <a href="https://wa.me/5511934946547?text=${encodeURIComponent('Olá, tenho interesse no imóvel: ' + p.title)}" target="_blank" class="btn-whatsapp">
                    <i class="fab fa-whatsapp"></i> Entrar em Contato via WhatsApp
                </a>
            </div>
        `;
        modal.style.display = 'block';
    };

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        renderProperties({
            type: document.getElementById('filter-type').value,
            status: document.getElementById('filter-status').value,
            city: document.getElementById('filter-city').value.trim(),
            price: document.getElementById('filter-price').value.trim()
        });
    });

    if (closeModal) closeModal.onclick = () => modal.style.display = 'none';
    window.addEventListener('click', (event) => { if (event.target === modal) modal.style.display = 'none'; });
    renderProperties();
};

const initAdminArea = () => {
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const adminNav = document.getElementById('admin-nav');
    const loginForm = document.getElementById('login-form');
    const adminTableBody = document.getElementById('admin-table-body');
    const logoutBtn = document.getElementById('logout-btn');
    const openNewModal = document.getElementById('open-modal-new');
    const crudModal = document.getElementById('modal-crud');
    const closeModalCrud = crudModal?.querySelector('.close-modal');
    const propertyForm = document.getElementById('property-form');
    const cancelBtn = document.getElementById('cancel-btn');
    if (!loginSection && !adminDashboard) return;

    const updateStats = () => {
        const properties = getProperties();
        document.getElementById('total-properties').textContent = properties.length;
        document.getElementById('total-sale').textContent = properties.filter(p => p.status === 'Venda').length;
        document.getElementById('total-rent').textContent = properties.filter(p => p.status === 'Aluguel').length;
    };

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

    const renderAdminTable = () => {
        const properties = getProperties();
        adminTableBody.innerHTML = '';
        updateStats();
        properties.forEach(p => {
            const images = getImagesArray(p);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${images[0]}" class="table-thumb" alt="${p.title}"></td>
                <td>${p.title}</td>
                <td>${p.type}</td>
                <td><span class="status-badge ${p.status.toLowerCase()}">${p.status}</span></td>
                <td>${formatPrice(p.price)}</td>
                <td>${p.city}</td>
                <td>
                    <button class="btn-primary btn-sm" onclick="editProperty(${p.id})">Editar</button>
                    <button class="btn-danger btn-sm" onclick="deleteProperty(${p.id})">Excluir</button>
                </td>
            `;
            adminTableBody.appendChild(tr);
        });
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const error = document.getElementById('login-error');
        if (user === 'admin' && pass === '123') {
            setAuth(true);
            error.classList.add('hidden');
            updateAuthUI();
            renderAdminTable();
        } else {
            error.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', (e) => { e.preventDefault(); setAuth(false); updateAuthUI(); });
    openNewModal.addEventListener('click', () => { 
        propertyForm.reset(); 
        document.getElementById('property-id').value = ''; 
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> Cadastrar Imóvel'; 
        crudModal.style.display = 'block'; 
    });
    cancelBtn?.addEventListener('click', () => crudModal.style.display = 'none');
    if (closeModalCrud) closeModalCrud.onclick = () => crudModal.style.display = 'none';
    window.addEventListener('click', (event) => { if (event.target === crudModal) crudModal.style.display = 'none'; });

    propertyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('property-id').value;
        const properties = getProperties();
        const images = [
            document.getElementById('prop-image').value.trim(),
            document.getElementById('prop-image-2').value.trim(),
            document.getElementById('prop-image-3').value.trim(),
            document.getElementById('prop-image-4').value.trim(),
            document.getElementById('prop-image-5').value.trim()
        ].filter(Boolean).slice(0,5);

        const propData = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('prop-title').value,
            type: document.getElementById('prop-type').value,
            status: document.getElementById('prop-status').value,
            price: parseFloat(document.getElementById('prop-price').value),
            city: document.getElementById('prop-city').value,
            image: images[0] || '',
            images,
            description: document.getElementById('prop-description').value
        };

        if (id) {
            const index = properties.findIndex(p => p.id === parseInt(id));
            if (index !== -1) properties[index] = propData;
        } else {
            properties.push(propData);
        }
        saveProperties(properties);
        crudModal.style.display = 'none';
        renderAdminTable();
    });

    window.editProperty = (id) => {
        const p = getProperties().find(item => item.id === id);
        if (!p) return;
        const images = getImagesArray(p);
        document.getElementById('property-id').value = p.id;
        document.getElementById('prop-title').value = p.title;
        document.getElementById('prop-type').value = p.type;
        document.getElementById('prop-status').value = p.status;
        document.getElementById('prop-price').value = p.price;
        document.getElementById('prop-city').value = p.city;
        document.getElementById('prop-image').value = images[0] || '';
        document.getElementById('prop-image-2').value = images[1] || '';
        document.getElementById('prop-image-3').value = images[2] || '';
        document.getElementById('prop-image-4').value = images[3] || '';
        document.getElementById('prop-image-5').value = images[4] || '';
        document.getElementById('prop-description').value = p.description;
        document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> Editar Imóvel';
        crudModal.style.display = 'block';
    };

    window.deleteProperty = (id) => {
        if (confirm('Tem certeza que deseja excluir este imóvel?')) {
            let properties = getProperties().filter(p => p.id !== id);
            saveProperties(properties);
            renderAdminTable();
        }
    };

    updateAuthUI();
    if (checkAuth()) renderAdminTable();
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('property-grid')) initPublicArea();
    else if (document.getElementById('login-section')) initAdminArea();
});