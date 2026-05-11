// artfoma — основной скрипт (полностью на данных из content.json)

(function() {
    // ==================== Глобальные переменные ====================
    let siteContent = null;
    let maxProjectsReached = false;
    let animationTriggered = false;
    
    // ==================== Загрузка контента из JSON ====================
    async function loadContent() {
        try {
            const response = await fetch('data/content.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            siteContent = await response.json();
            
            // Проверяем, что данные имеют минимально необходимую структуру
            if (!siteContent.meta || !siteContent.features || !siteContent.works) {
                throw new Error('Неполные данные в content.json: отсутствуют meta, features или works');
            }
            
            renderContent();
            return true;
        } catch (error) {
            console.error('❌ Ошибка загрузки content.json:', error);
            // Показываем сообщение об ошибке прямо на странице
            showErrorScreen(error.message);
            return false;
        }
    }
    
    function showErrorScreen(errorMessage) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #F1EDFF; font-family: 'Courier New', monospace; padding: 2rem; text-align: center;">
                <div style="background: white; border: 4px solid #000; padding: 2rem; max-width: 500px; box-shadow: 12px 12px 0px 0px #000;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h1 style="color: #8D50F0; margin-bottom: 1rem; font-size: 1.5rem;">Ошибка загрузки данных</h1>
                    <p style="margin-bottom: 1rem; color: #333;">Не удалось загрузить <code style="background:#000; color:#B7F31E; padding:0.2rem 0.5rem; display: inline-block;">data/content.json</code></p>
                    <p style="color: #666; font-size: 0.8rem; margin-bottom: 1rem;">${escapeHtml(errorMessage)}</p>
                    <small style="color: #888;">Убедитесь, что файл существует и имеет правильную структуру JSON.</small>
                    <hr style="margin: 1rem 0; border-color: #ddd;">
                    <button onclick="location.reload()" style="background: #B7F31E; border: 2px solid #000; padding: 0.5rem 1rem; font-family: monospace; font-weight: bold; cursor: pointer;">⟳ ПЕРЕЗАГРУЗИТЬ</button>
                </div>
            </div>
        `;
    }
    
    // ==================== Рендер контента ====================
    function renderContent() {
        if (!siteContent) return;
        
        // Meta контент
        if (siteContent.meta) {
            document.title = siteContent.meta.title || "artfoma";
            const taglineEl = document.getElementById('tagline');
            if (taglineEl) taglineEl.textContent = siteContent.meta.tagline || "[ идея // код // релиз ]";
            const heroDescEl = document.getElementById('heroDesc');
            if (heroDescEl) heroDescEl.textContent = siteContent.meta.heroDesc || "Делаем сложное простым, а скучное — прибыльным.";
            const copyrightEl = document.getElementById('copyright');
            if (copyrightEl) copyrightEl.textContent = siteContent.meta.copyright || "artfoma © 2026";
            const contactEmailEl = document.getElementById('contactEmail');
            if (contactEmailEl) contactEmailEl.textContent = siteContent.meta.contactEmail || "studio@artfoma.ru";
        }
        
        // Заголовки секций
        if (siteContent.sections) {
            const featuresTitleEl = document.getElementById('featuresTitle');
            if (featuresTitleEl && siteContent.sections.featuresTitle) 
                featuresTitleEl.innerHTML = siteContent.sections.featuresTitle;
            const worksTitleEl = document.getElementById('worksTitle');
            if (worksTitleEl && siteContent.sections.worksTitle) 
                worksTitleEl.innerHTML = siteContent.sections.worksTitle;
        }
        
        // Услуги (features)
        if (siteContent.features && siteContent.features.length) {
            const featuresGrid = document.getElementById('featuresGrid');
            if (featuresGrid) {
                featuresGrid.innerHTML = '';
                siteContent.features.forEach(feature => {
                    const card = document.createElement('div');
                    card.className = 'feature-card';
                    card.innerHTML = `
                        <div class="feature-icon">${escapeHtml(feature.icon || '◈')}</div>
                        <h3>${escapeHtml(feature.title || '')}</h3>
                        <p>${escapeHtml(feature.description || '')}</p>
                        <span class="feature-meta">${escapeHtml(feature.meta || '')}</span>
                    `;
                    featuresGrid.appendChild(card);
                });
            }
        }
        
        // Проекты (works)
        if (siteContent.works && siteContent.works.length) {
            window.initialWorksCount = siteContent.works.length;
            window.allAdditionalProjects = siteContent.additionalProjects || [];
            window.allWorks = [...siteContent.works];
            renderWorks(window.allWorks);
        } else {
            console.warn('Нет проектов в content.json');
        }
        
        // Социальные сети
        if (siteContent.socials && siteContent.socials.length) {
            const socialIcons = document.getElementById('socialIcons');
            if (socialIcons) {
                socialIcons.innerHTML = '';
                siteContent.socials.forEach(social => {
                    const link = document.createElement('span');
                    link.className = 'social-link';
                    link.setAttribute('data-social', social.name);
                    link.textContent = social.name;
                    link.style.cursor = 'pointer';
                    socialIcons.appendChild(link);
                });
                attachSocialListeners();
            }
        }
        
        // Настройка максимального количества проектов
        window.maxProjects = siteContent.maxProjects || (siteContent.works ? siteContent.works.length + (siteContent.additionalProjects ? siteContent.additionalProjects.length : 0) : 5);
        
        // Сохраняем шаги лоадера для использования в initLoader
        window.loaderSteps = siteContent.loaderSteps || ["Правки: всё", "Загрузка: ComicSans", "Сделай «вау»", "Правка последняя. (Самая смешная ложь)"];
    }
    
    function renderWorks(works) {
        const workGrid = document.getElementById('workGrid');
        if (!workGrid) return;
        
        workGrid.innerHTML = '';
        works.forEach(work => {
            const item = document.createElement('div');
            item.className = 'work-item';
            const previewStyle = work.previewStyle || 'repeating-linear-gradient(45deg, #B7F31E 0px, #B7F31E 8px, #8D50F0 8px, #8D50F0 16px)';
            item.innerHTML = `
                <div class="work-preview" style="background: ${previewStyle};"></div>
                <div class="work-info">
                    <h4>${escapeHtml(work.title || '')}</h4>
                    <span class="work-year">${escapeHtml(work.year || '')}</span>
                    <p>${escapeHtml(work.description || '')}</p>
                </div>
            `;
            workGrid.appendChild(item);
            attachWorkClick(item);
        });
        
        // Анимация появления для новых элементов
        document.querySelectorAll('.work-item').forEach(el => {
            el.style.opacity = '0';
            if (window.workObserver) {
                window.workObserver.observe(el);
            }
        });
        
        // Проверка лимита проектов для кнопки "показать_ещё"
        const moreBtn = document.getElementById('moreBtn');
        if (moreBtn) {
            const currentCount = window.allWorks ? window.allWorks.length : 0;
            const additionalCount = window.allAdditionalProjects ? window.allAdditionalProjects.length : 0;
            const totalAvailable = (window.initialWorksCount || 0) + additionalCount;
            
            if (currentCount >= totalAvailable || currentCount >= window.maxProjects) {
                moreBtn.style.opacity = '0.5';
                maxProjectsReached = true;
            } else {
                moreBtn.style.opacity = '1';
                maxProjectsReached = false;
            }
        }
    }
    
    function addProject(project) {
        if (!window.allWorks) window.allWorks = [];
        if (window.allWorks.length >= window.maxProjects) {
            brutalNotify('МАКСИМУМ ПРОЕКТОВ');
            return false;
        }
        
        window.allWorks.push(project);
        renderWorks(window.allWorks);
        return true;
    }
    
    // ==================== Утилиты ====================
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    // ==================== Лоадер ====================
    function initLoader() {
        const loader = document.getElementById('loaderScene');
        const mainContent = document.getElementById('mainContent');
        const progressBar = document.getElementById('progressBar');
        const loaderText = document.getElementById('loaderText');
        const fomaElement = document.getElementById('fomaTitle');
        
        if (!loader || !mainContent) return;
        
        let progress = 0;
        const steps = window.loaderSteps || ["инициализация", "калибровка спирали", "активация неона", "готово"];
        let stepIdx = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 10 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if (progressBar) progressBar.style.width = '100%';
                if (loaderText) loaderText.textContent = steps[steps.length - 1] || 'готово // artfoma';
                
                if (fomaElement && !animationTriggered) {
                    animationTriggered = true;
                    setTimeout(() => {
                        fomaElement.classList.add('filled');
                    }, 300);
                }
                
                setTimeout(() => {
                    if (loader) {
                        loader.classList.add('fade-out');
                        setTimeout(() => {
                            if (loader) loader.style.display = 'none';
                        }, 600);
                    }
                    if (mainContent) mainContent.classList.add('visible');
                    initSpiralParallax();
                }, 400);
            }
            if (progressBar) progressBar.style.width = `${progress}%`;
            
            // Обновляем текст лоадера в зависимости от прогресса
            const stepIndex = Math.floor((progress / 100) * steps.length);
            if (stepIndex > stepIdx && stepIndex < steps.length) {
                stepIdx = stepIndex;
                if (loaderText && steps[stepIdx]) loaderText.textContent = steps[stepIdx];
            }
        }, 100);
    }
    
    // ==================== Спиральный параллакс ====================
    function initSpiralParallax() {
        const spiral = document.getElementById('spiralImg');
        if (!spiral) return;
        
        let targetTranslate = 0;
        let currentTranslate = 0;
        
        function smoothUpdate() {
            currentTranslate += (targetTranslate - currentTranslate) * 0.07;
            spiral.style.transform = `translateY(-50%) translateX(${currentTranslate}%)`;
            requestAnimationFrame(smoothUpdate);
        }
        
        smoothUpdate();
        
        function updateTarget() {
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                const scrollPercent = Math.min(1, Math.max(0, scrollY / maxScroll));
                targetTranslate = -(scrollPercent * 45);
            }
        }
        
        window.addEventListener('scroll', updateTarget);
        window.addEventListener('resize', updateTarget);
        updateTarget();
    }
    
    // ==================== Уведомления ====================
    function brutalNotify(text) {
        const toast = document.createElement('div');
        toast.className = 'brutal-toast';
        toast.textContent = `>> ${text} <<`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, 2800);
    }
    
    // ==================== Обработчики событий ====================
    function attachWorkClick(el) {
        el.addEventListener('click', () => {
            const title = el.querySelector('h4')?.innerText || 'проект';
            brutalNotify(`ОТКРЫТО: ${title}`);
            el.style.filter = 'hue-rotate(15deg)';
            setTimeout(() => el.style.filter = '', 200);
        });
    }
    
    function attachSocialListeners() {
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const socialName = link.innerText.toUpperCase();
                brutalNotify(`ПЕРЕХОД НА ${socialName}`);
                
                // Если в JSON есть URL для этой соцсети, можно добавить реальный переход
                if (siteContent?.socials) {
                    const socialData = siteContent.socials.find(s => s.name.toLowerCase() === link.innerText.toLowerCase());
                    if (socialData && socialData.url && socialData.url !== '#') {
                        setTimeout(() => {
                            window.open(socialData.url, '_blank');
                        }, 300);
                    }
                }
            });
        });
    }
    
    function initButtons() {
        const exploreBtn = document.getElementById('exploreBtn');
        const projectsBtn = document.getElementById('projectsBtn');
        const moreBtn = document.getElementById('moreBtn');
        
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                brutalNotify('Мы могли бы написать «цена по запросу», но мы не зануды.');
                document.querySelector('.features-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        if (projectsBtn) {
            projectsBtn.addEventListener('click', () => {
                brutalNotify('КЕЙСЫ ЗАГРУЖЕНЫ');
                document.querySelector('.work-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                if (maxProjectsReached) {
                    brutalNotify('МАКСИМУМ ПРОЕКТОВ');
                    return;
                }
                
                const currentCount = window.allWorks ? window.allWorks.length : 0;
                const additionalProjects = window.allAdditionalProjects || [];
                const nextIndex = currentCount - (window.initialWorksCount || 0);
                
                if (nextIndex < additionalProjects.length) {
                    const nextProject = additionalProjects[nextIndex];
                    if (nextProject) {
                        addProject(nextProject);
                        brutalNotify(`+1 ПРОЕКТ // ${nextProject.title}`);
                    } else {
                        brutalNotify('БОЛЬШЕ НЕТ ПРОЕКТОВ');
                        maxProjectsReached = true;
                    }
                } else {
                    brutalNotify('БОЛЬШЕ НЕТ ПРОЕКТОВ');
                    maxProjectsReached = true;
                }
            });
        }
    }
    
    // ==================== Анимация кликов ====================
    function initClickAnimations() {
        document.querySelectorAll('.feature-card, .work-item, .brutal-btn, .social-link').forEach(el => {
            el.addEventListener('mousedown', () => {
                el.style.transform = 'translate(2px, 2px)';
                setTimeout(() => { 
                    if (el) el.style.transform = ''; 
                }, 100);
            });
        });
    }
    
    // ==================== Кастомный курсор ====================
    function initCustomCursor() {
        if (window.innerWidth <= 768) return;
        
        const cursor = document.getElementById('customCursor');
        if (!cursor) return;
        
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.25;
            cursorY += (mouseY - cursorY) * 0.25;
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }
    
    // ==================== Intersection Observer для анимаций ====================
    function initIntersectionObserver() {
        window.workObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeUp 0.5s ease forwards';
                    window.workObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.feature-card, .work-item').forEach(el => {
            el.style.opacity = '0';
            window.workObserver.observe(el);
        });
    }
    
    // ==================== Инициализация ====================
    async function init() {
        await loadContent();
        initLoader();
        initButtons();
        initClickAnimations();
        initCustomCursor();
        initIntersectionObserver();
    }
    
    // Запуск
    init();
})();