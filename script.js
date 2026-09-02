const STORAGE_KEY = 'imobiliaria_properties';
const AUTH_KEY = 'imobiliaria_auth';
const IMAGES_KEY = 'imobiliaria_images';

const initialData = [
    {
        id: 1,
        title: "Mansão Moderna no Condomínio",
        type: "Casa",
        status: "Venda",
        price: 1500000,
        city: "São Paulo",
        images: [],
        imageIds: [],
        description: "Uma casa espetacular com piscina privativa, 4 suítes e acabamento de luxo."
    },
    {
        id: 2,
        title: "Apartamento Central Luxo",
        type: "Apartamento",
        status: "Aluguel",
        price: 4500,
        city: "Rio de Janeiro",
        images: [],
        imageIds: [],
        description: "Localização privilegiada, próximo a tudo o que você precisa para o seu dia a dia."
    },
    {
        id: 3,
        title: "Casa de Campo Relaxante",
        type: "Casa",
        status: "Venda",
        price: 850000,
        city: "Gramado",
        images: [],
        imageIds: [],
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

const getImages = () => {
    const data = localStorage.getItem(IMAGES_KEY);
    return data ? JSON.parse(data) : {};
};

const saveImages = (images) => localStorage.setItem(IMAGES_KEY, JSON.stringify(images));

const checkAuth = () => localStorage.getItem(AUTH_KEY) === 'true';
const setAuth = (status) => localStorage.setItem(AUTH_KEY, status);
const formatPrice = (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`;

const getPropertyImages = (prop) => {
    const allImages = getImages();
    if (prop.imageIds && prop.imageIds.length > 0) {
        return prop.imageIds.map(id => allImages[id] || '').filter(Boolean);
    }
    if (prop.images && prop.images.length > 0) {
        return prop.images;
    }
    return ['https://via.placeholder.com/800x600?text=Sem+Imagem'];
};

const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

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
            const images = getPropertyImages(p);
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
        const images = getPropertyImages(p);
        const modalBody = document.getElementById('modal-body');
        const whatsappMessage = `Olá! Vim pelo site e tenho interesse no imóvel:

🏠 *${p.title}*
💰 *${formatPrice(p.price)}*
📍 ${p.city} - ${p.type}
📋 ${p.status}

Gostaria de mais informações!`;
        
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
                <a href="https://wa.me/5511934946547?text=${encodeURIComponent(whatsappMessage)}" target="_blank" class="btn-whatsapp">
                    <i class="fab fa-whatsapp"></i> Tenho Interesse neste Imóvel
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
            const images = getPropertyImages(p);
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
        document.getElementById('image-preview-container').innerHTML = '';
        crudModal.style.display = 'block'; 
    });
    cancelBtn?.addEventListener('click', () => crudModal.style.display = 'none');
    if (closeModalCrud) closeModalCrud.onclick = () => crudModal.style.display = 'none';
    window.addEventListener('click', (event) => { if (event.target === crudModal) crudModal.style.display = 'none'; });

    propertyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('property-id').value;
        const properties = getProperties();
        const allImages = getImages();
        const imageFiles = [];
        const imageIds = [];

        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`prop-image-${i}`);
            if (input && input.files && input.files[0]) {
                imageFiles.push(input.files[0]);
            }
        }

        if (imageFiles.length > 0) {
            for (const file of imageFiles) {
                const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                try {
                    const base64 = await convertFileToBase64(file);
                    allImages[imageId] = base64;
                    imageIds.push(imageId);
                } catch (error) {
                    console.error('Erro ao converter imagem:', error);
                }
            }
            saveImages(allImages);
        }

        const propData = {
            id: id ? parseInt(id) : Date.now(),
            title: document.getElementById('prop-title').value,
            type: document.getElementById('prop-type').value,
            status: document.getElementById('prop-status').value,
            price: parseFloat(document.getElementById('prop-price').value),
            city: document.getElementById('prop-city').value,
            image: '',
            images: [],
            imageIds: imageIds.length > 0 ? imageIds : (id ? getProperties().find(p => p.id === parseInt(id))?.imageIds || [] : []),
            description: document.getElementById('prop-description').value
        };

        if (id) {
            const index = properties.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                if (imageIds.length === 0) {
                    propData.imageIds = properties[index].imageIds || [];
                }
                properties[index] = propData;
            }
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
        const images = getPropertyImages(p);
        document.getElementById('property-id').value = p.id;
        document.getElementById('prop-title').value = p.title;
        document.getElementById('prop-type').value = p.type;
        document.getElementById('prop-status').value = p.status;
        document.getElementById('prop-price').value = p.price;
        document.getElementById('prop-city').value = p.city;
        document.getElementById('prop-description').value = p.description;

        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`prop-image-${i}`);
            if (input) {
                input.value = '';
            }
        }

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