(function () {
    let allItems = [];
    let activeFilter = 'all';

    // ==================== ЗАГРУЗКА СПИСКА ====================
    async function loadAchievements() {
        const grid = document.getElementById('achievementsGrid');
        try {
            const res = await fetch('data/achievements.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            allItems = data.items || [];
            const folder = data.folder || 'img/diploma';

            if (allItems.length === 0) {
                grid.innerHTML = '<div class="achievements-loading">Пока нет достижений</div>';
                return;
            }

            renderAchievements(folder);

        } catch (err) {
            console.error('❌ Ошибка загрузки достижений:', err);
            grid.innerHTML = `
                <div class="achievements-loading">
                    ⚠️ Не удалось загрузить data/achievements.json<br>
                    <span style="font-size:0.8rem;color:#666;">${escapeHtml(err.message)}</span>
                </div>
            `;
        }
    }

    // ==================== РЕНДЕР ====================
    function renderAchievements(folder) {
        const grid = document.getElementById('achievementsGrid');
        grid.innerHTML = '';

        const filtered = allItems.filter(item => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'pdf') return isPdf(item);
            if (activeFilter === 'image') return !isPdf(item);
            return true;
        });

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="achievements-loading">Нет файлов в этой категории</div>';
            return;
        }

        filtered.forEach(item => {
            const path = `${folder}/${item.file}`;
            const pdf = isPdf(item);

            const card = document.createElement('div');
            card.className = 'achievement-full';

            const previewHTML = pdf
                ? `<div class="pdf-placeholder">📄 PDF</div>
                   <iframe src="${path}#toolbar=0&navpanes=0" title="${escapeHtml(item.title)}"></iframe>`
                : `<img src="${path}" alt="${escapeHtml(item.title)}" loading="lazy" data-full="${path}">`;

            card.innerHTML = `
                <div class="achievement-preview">${previewHTML}</div>
                <div class="achievement-info">
                    <h4>${escapeHtml(item.title || item.file)}</h4>
                    <span class="achievement-year">${escapeHtml(item.year || '')} · ${pdf ? 'PDF' : 'IMG'}</span>
                    <div class="achievement-actions">
                        <a class="brutal-btn" href="${path}" target="_blank" rel="noopener">открыть ↗</a>
                        <a class="brutal-btn secondary" href="${path}" download>скачать ↓</a>
                    </div>
                </div>
            `;

            const img = card.querySelector('img[data-full]');
            if (img) {
                img.addEventListener('click', () => openImageModal(path, item.title));
            }

            grid.appendChild(card);
        });
    }

    // ==================== ФИЛЬТРЫ ====================
    function initFilters() {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.dataset.filter;
                const folder = (window.__achievementsFolder) || 'img/diploma';
                renderAchievements(folder);
            });
        });
    }

    // ==================== МОДАЛКА PNG ====================
    function openImageModal(src, title) {
        const modal = document.getElementById('imageModal');
        const img = document.getElementById('imageModalImg');
        const t = document.getElementById('imageModalTitle');
        if (!modal || !img) return;
        img.src = src;
        if (t) t.textContent = `// ${title || 'просмотр'}`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function initModal() {
        const modal = document.getElementById('imageModal');
        const close = document.getElementById('imageModalClose');
        if (close) close.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // ==================== УТИЛКИ ====================
    function isPdf(item) {
        const f = (item.file || '').toLowerCase();
        const t = (item.type || '').toLowerCase();
        return t === 'pdf' || f.endsWith('.pdf');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    document.addEventListener('DOMContentLoaded', () => {
        initModal();
        initFilters();
        loadAchievements();
    });
})();