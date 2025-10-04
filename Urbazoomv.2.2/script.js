// Simulação de armazenamento em TXT (usando localStorage como substituto)
let users = JSON.parse(localStorage.getItem('urbazoom_users') || '[]');
let reclamacoes = JSON.parse(localStorage.getItem('urbazoom_reclamacoes') || '[]');
let currentUser = JSON.parse(localStorage.getItem('urbazoom_current_user') || 'null');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    if (currentUser) {
        showUserInterface();
    }
    startCarousel();
    updateStats();
    displayReclamacoes();
});

// Carousel Functions
function startCarousel() {
    const images = document.querySelectorAll('#carousel img');
    let currentIndex = 0;

    if (images.length === 0) return;

    setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    }, 3000);
}

// Modal Functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegister() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// User Registration
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const city = document.getElementById('registerCity').value.trim();

    // Validações
    if (!name || !email || !password || !city) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (users.find(user => user.email === email)) {
        alert('Email já cadastrado!');
        return;
    }

    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        city,
        registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsersToStorage();
    
    alert('Cadastro realizado com sucesso!');
    closeModal('registerModal');
    document.getElementById('registerModal').querySelector('form').reset();
    updateStats();
}

// User Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('urbazoom_current_user', JSON.stringify(user));
        showUserInterface();
        closeModal('loginModal');
        document.getElementById('loginModal').querySelector('form').reset();
    } else {
        alert('Email ou senha incorretos!');
    }
}

// User Interface Management
function showUserInterface() {
    document.getElementById('navButtons').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('crudPanel').classList.remove('hidden');
    updateStats();
    displayReclamacoesCrud();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('urbazoom_current_user');
    document.getElementById('navButtons').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('crudPanel').classList.add('hidden');
    updateStats();
}

// Reclamação Management
function showAddReclamacao() {
    document.getElementById('reclamacaoModalTitle').textContent = '➕ Nova Reclamação';
    document.getElementById('editReclamacaoId').value = '';
    document.getElementById('reclamacaoModal').querySelector('form').reset();
    document.getElementById('reclamacaoModal').style.display = 'block';
}

function handleReclamacao(event) {
    event.preventDefault();
    
    const titulo = document.getElementById('reclamacaoTitulo').value.trim();
    const descricao = document.getElementById('reclamacaoDescricao').value.trim();
    const local = document.getElementById('reclamacaoLocal').value.trim();
    const prioridade = document.getElementById('reclamacaoPrioridade').value;
    const editId = document.getElementById('editReclamacaoId').value;

    // Validações
    if (!titulo || !descricao || !local || !prioridade) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (editId) {
        // Editar reclamação existente
        const index = reclamacoes.findIndex(r => r.id == editId);
        if (index !== -1) {
            reclamacoes[index] = {
                ...reclamacoes[index],
                titulo,
                descricao,
                local,
                prioridade,
                updatedAt: new Date().toISOString()
            };
        }
        alert('Reclamação atualizada com sucesso!');
    } else {
        // Nova reclamação
        const newReclamacao = {
            id: Date.now(),
            titulo,
            descricao,
            local,
            prioridade,
            userId: currentUser.id,
            userName: currentUser.name,
            userCity: currentUser.city,
            createdAt: new Date().toISOString()
        };
        reclamacoes.push(newReclamacao);
        alert('Reclamação criada com sucesso!');
    }

    saveReclamacoesToStorage();
    closeModal('reclamacaoModal');
    updateStats();
    displayReclamacoes();
    displayReclamacoesCrud();
}

function editReclamacao(id) {
    const reclamacao = reclamacoes.find(r => r.id === id);
    if (reclamacao && reclamacao.userId === currentUser.id) {
        document.getElementById('reclamacaoModalTitle').textContent = '✏️ Editar Reclamação';
        document.getElementById('reclamacaoTitulo').value = reclamacao.titulo;
        document.getElementById('reclamacaoDescricao').value = reclamacao.descricao;
        document.getElementById('reclamacaoLocal').value = reclamacao.local;
        document.getElementById('reclamacaoPrioridade').value = reclamacao.prioridade;
        document.getElementById('editReclamacaoId').value = id;
        document.getElementById('reclamacaoModal').style.display = 'block';
    } else {
        alert('Você só pode editar suas próprias reclamações!');
    }
}

function deleteReclamacao(id) {
    const reclamacao = reclamacoes.find(r => r.id === id);
    if (reclamacao && reclamacao.userId === currentUser.id) {
        if (confirm('Tem certeza que deseja excluir esta reclamação?')) {
            reclamacoes = reclamacoes.filter(r => r.id !== id);
            saveReclamacoesToStorage();
            updateStats();
            displayReclamacoes();
            displayReclamacoesCrud();
            alert('Reclamação excluída com sucesso!');
        }
    } else {
        alert('Você só pode excluir suas próprias reclamações!');
    }
}

// Display Functions
function displayReclamacoes() {
    const container = document.getElementById('reclamacoesList');
    if (!container) return;
    
    const recentReclamacoes = reclamacoes.slice(-10).reverse();
    
    if (recentReclamacoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma reclamação encontrada</p>';
        return;
    }
    
    container.innerHTML = recentReclamacoes.map(r => `
        <div class="reclamacao-item ${r.prioridade}">
            <strong>${escapeHtml(r.titulo)}</strong><br>
            <small>📍 ${escapeHtml(r.local)}</small><br>
            <small>👤 ${escapeHtml(r.userName)} - ${escapeHtml(r.userCity || 'N/A')}</small><br>
            <small>⏰ ${formatDate(r.createdAt)}</small>
        </div>
    `).join('');
}

function displayReclamacoesCrud() {
    if (!currentUser) return;
    
    const container = document.getElementById('reclamacoesCrud');
    if (!container) return;
    
    const userReclamacoes = reclamacoes.filter(r => r.userId === currentUser.id);
    
    if (userReclamacoes.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Você ainda não criou nenhuma reclamação</p>';
        return;
    }
    
    container.innerHTML = userReclamacoes.map(r => `
        <div class="reclamacao-card ${r.prioridade}">
            <h4>${escapeHtml(r.titulo)}</h4>
            <p>${escapeHtml(r.descricao)}</p>
            <p><strong>📍 Local:</strong> ${escapeHtml(r.local)}</p>
            <p><strong>🏷️ Prioridade:</strong> ${getPriorityLabel(r.prioridade)}</p>
            <p><strong>⏰ Criado em:</strong> ${formatDate(r.createdAt)}</p>
            ${r.updatedAt ? `<p><strong>📝 Atualizado em:</strong> ${formatDate(r.updatedAt)}</p>` : ''}
            <div class="action-buttons">
                <button class="btn btn-edit btn-small" onclick="editReclamacao(${r.id})">✏️ Editar</button>
                <button class="btn btn-delete btn-small" onclick="deleteReclamacao(${r.id})">🗑️ Excluir</button>
            </div>
        </div>
    `).join('');
}

// Statistics Update
function updateStats() {
    const totalElement = document.getElementById('totalReclamacoes');
    const urgentesElement = document.getElementById('urgentesCount');
    const usuariosElement = document.getElementById('usuariosCount');
    
    if (totalElement) totalElement.textContent = reclamacoes.length;
    if (urgentesElement) urgentesElement.textContent = reclamacoes.filter(r => r.prioridade === 'urgente').length;
    if (usuariosElement) usuariosElement.textContent = users.length;
}

// Storage Functions
function saveUsersToStorage() {
    try {
        localStorage.setItem('urbazoom_users', JSON.stringify(users));
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        alert('Erro ao salvar dados dos usuários!');
    }
}

function saveReclamacoesToStorage() {
    try {
        localStorage.setItem('urbazoom_reclamacoes', JSON.stringify(reclamacoes));
    } catch (error) {
        console.error('Erro ao salvar reclamações:', error);
        alert('Erro ao salvar reclamações!');
    }
}

// Utility Functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Data inválida';
    }
}

function getPriorityLabel(priority) {
    const labels = {
        'urgente': '🔴 Urgente',
        'preocupante': '🟡 Preocupante',
        'atencao': '🟠 Requer Atenção'
    };
    return labels[priority] || priority;
}

// Event Listeners
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // ESC para fechar modais
    if (event.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            openModal.style.display = 'none';
        }
    }
});

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Enhanced form validation
document.addEventListener('DOMContentLoaded', function() {
    // Add real-time validation to forms
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ff4757';
                this.title = 'Por favor, insira um email válido';
            } else {
                this.style.borderColor = '#e1e1e1';
                this.title = '';
            }
        });
    });
    
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !validatePassword(this.value)) {
                this.style.borderColor = '#ff4757';
                this.title = 'A senha deve ter pelo menos 6 caracteres';
            } else {
                this.style.borderColor = '#e1e1e1';
                this.title = '';
            }
        });
    });
});

// Performance optimization - debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Auto-save functionality for forms (optional enhancement)
const debouncedSave = debounce(function(formData) {
    // Could implement auto-save to localStorage here
    console.log('Auto-saving form data...', formData);
}, 1000);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validatePassword,
        escapeHtml,
        formatDate,
        getPriorityLabel
    };
}