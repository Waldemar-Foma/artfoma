(function() {
    let siteContent = null;
    let maxProjectsReached = false;
    let animationTriggered = false;

    // ==================== ЗАГРУЗКА КОНТЕНТА ====================
    async function loadContent() {
        try {
            const response = await fetch('data/content.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            siteContent = await response.json();
            renderContent();
            return true;
        } catch (error) {
            console.error('❌ Ошибка:', error);
            showErrorScreen(error.message);
            return false;
        }
    }

    function showErrorScreen(msg) {
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#F1EDFF;font-family:monospace;padding:2rem;text-align:center;">
                <div style="background:#fff;border:4px solid #000;padding:2rem;max-width:500px;box-shadow:12px 12px 0 #000;">
                    <div style="font-size:3rem;margin-bottom:1rem;">⚠️</div>
                    <h1 style="color:#8D50F0;margin-bottom:1rem;font-size:1.5rem;">Ошибка загрузки</h1>
                    <p style="margin-bottom:1rem;color:#333;">Не удалось загрузить data/content.json</p>
                    <p style="color:#666;font-size:0.8rem;">${escapeHtml(msg)}</p>
                    <button onclick="location.reload()" style="background:#B7F31E;border:2px solid #000;padding:0.5rem 1rem;font-family:monospace;font-weight:bold;cursor:pointer;margin-top:1rem;">⟳ ПЕРЕЗАГРУЗИТЬ</button>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // ==================== РЕНДЕРИНГ ====================
    function renderContent() {
        if (!siteContent) return;

        // Meta
        if (siteContent.meta) {
            document.title = siteContent.meta.title || 'artfoma';
            const taglineEl = document.getElementById('tagline');
            if (taglineEl) taglineEl.textContent = siteContent.meta.tagline || '[ идея // код // релиз ]';
            const heroDescEl = document.getElementById('heroDesc');
            if (heroDescEl) heroDescEl.textContent = siteContent.meta.heroDesc || 'Делаем сложное простым, а скучное — прибыльным.';
            const copyrightEl = document.getElementById('copyright');
            if (copyrightEl) copyrightEl.textContent = siteContent.meta.copyright || 'artfoma © 2026';
            const contactEmailEl = document.getElementById('contactEmail');
            if (contactEmailEl) contactEmailEl.textContent = siteContent.meta.contactEmail || 'studio@artfoma.ru';
        }

        // Заголовки секций
        if (siteContent.sections) {
            const featuresTitleEl = document.getElementById('featuresTitle');
            if (featuresTitleEl) featuresTitleEl.innerHTML = siteContent.sections.featuresTitle || '&lt; услуги &gt;';
            const worksTitleEl = document.getElementById('worksTitle');
            if (worksTitleEl) worksTitleEl.innerHTML = siteContent.sections.worksTitle || '// работы';
            const contactTitleEl = document.getElementById('contactTitle');
            if (contactTitleEl) contactTitleEl.innerHTML = siteContent.sections.cliTitle || '// контакт';
        }

        // Услуги
        if (siteContent.features) {
            const grid = document.getElementById('featuresGrid');
            if (!grid) return;
            grid.innerHTML = '';
            siteContent.features.forEach(f => {
                const card = document.createElement('div');
                card.className = 'feature-card';
                card.innerHTML = `
                    <div class="feature-icon">${escapeHtml(f.icon || '◈')}</div>
                    <h3>${escapeHtml(f.title)}</h3>
                    <p>${escapeHtml(f.description)}</p>
                    ${f.result ? `<p class="feature-result">→ ${escapeHtml(f.result)}</p>` : ''}
                    <span class="feature-meta">${escapeHtml(f.meta || '')}</span>
                `;
                grid.appendChild(card);
            });
        }

        // Работы
        if (siteContent.works) {
            window.initialWorksCount = siteContent.works.length;
            window.allAdditionalProjects = siteContent.additionalProjects || [];
            window.allWorks = [...siteContent.works];
            window.maxProjects = siteContent.maxProjects || (siteContent.works.length + (siteContent.additionalProjects || []).length);
            renderWorks(window.allWorks);
        }

        // Соцсети
        if (siteContent.socials) {
            const container = document.getElementById('socialIcons');
            if (!container) return;
            container.innerHTML = '';
            siteContent.socials.forEach(s => {
                const link = document.createElement('span');
                link.className = 'social-link';
                link.textContent = s.name;
                link.dataset.url = s.url || '#';
                link.addEventListener('click', () => {
                    brutalNotify(`ПЕРЕХОД НА ${s.name.toUpperCase()}`);
                    if (s.url && s.url !== '#') setTimeout(() => window.open(s.url, '_blank'), 300);
                });
                container.appendChild(link);
            });
        }

        // Калькулятор
        if (siteContent.calculator) {
            window.calculatorData = siteContent.calculator;
            if (siteContent.calculator.packages) {
                renderCalculatorNew(siteContent.calculator);
            } else if (siteContent.calculator.options) {
                renderCalculatorOld(siteContent.calculator.options);
            }
        }

        // Глитч-контролы
        if (siteContent.glitchControls) {
            renderGlitchControls(siteContent.glitchControls.controls);
        }

        window.loaderSteps = siteContent.loaderSteps || ['инициализация', 'калибровка', 'активация', 'готово'];
    }

    // ==================== РЕНДЕРИНГ РАБОТ ====================
    function renderWorks(works) {
        const grid = document.getElementById('workGrid');
        if (!grid) return;
        grid.innerHTML = '';
        works.forEach(work => {
            const item = document.createElement('div');
            item.className = 'work-item';
            item.innerHTML = `
                <div class="work-preview" style="background: ${work.previewStyle || 'repeating-linear-gradient(45deg, #B7F31E 0px, #B7F31E 8px, #8D50F0 8px, #8D50F0 16px)'};"></div>
                <div class="work-info">
                    <h4>${escapeHtml(work.title)}</h4>
                    <span class="work-year">${escapeHtml(work.year || '')}</span>
                    <p>${escapeHtml(work.description || '')}</p>
                </div>
            `;
            item.addEventListener('click', () => {
                brutalNotify(`ОТКРЫТО: ${work.title}`);
                item.style.filter = 'hue-rotate(15deg)';
                setTimeout(() => item.style.filter = '', 200);
            });
            grid.appendChild(item);
        });

        const moreBtn = document.getElementById('moreBtn');
        if (!moreBtn) return;
        const total = (window.initialWorksCount || 0) + (window.allAdditionalProjects || []).length;
        const current = works.length;
        if (current >= total || current >= window.maxProjects) {
            moreBtn.style.opacity = '0.5';
            maxProjectsReached = true;
        } else {
            moreBtn.style.opacity = '1';
            maxProjectsReached = false;
        }
    }

    function addProject(project) {
        if (window.allWorks.length >= window.maxProjects) {
            brutalNotify('МАКСИМУМ ПРОЕКТОВ');
            return false;
        }
        window.allWorks.push(project);
        renderWorks(window.allWorks);
        return true;
    }

    // ==================== КАЛЬКУЛЯТОР (СТАРАЯ ВЕРСИЯ С OPTIONS) ====================
    function renderCalculatorOld(options) {
        const container = document.getElementById('calcParams');
        if (!container) return;
        container.innerHTML = '';

        const categories = options.reduce((acc, opt) => {
            const cat = opt.category || 'Основные';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(opt);
            return acc;
        }, {});

        let paramIndex = 0;

        Object.keys(categories).forEach(category => {
            const catOptions = categories[category];
            const group = document.createElement('div');
            group.className = 'param-group';

            const label = document.createElement('div');
            label.className = 'param-label';
            label.textContent = category;
            group.appendChild(label);

            if (catOptions[0].categoryDesc) {
                const desc = document.createElement('div');
                desc.className = 'param-description';
                desc.textContent = catOptions[0].categoryDesc;
                group.appendChild(desc);
            }

            if (catOptions.length > 2) {
                const grid = document.createElement('div');
                grid.className = 'calc-option-grid';
                catOptions.forEach((opt, idx) => {
                    const card = document.createElement('div');
                    card.className = 'calc-option-card';
                    card.dataset.index = paramIndex + idx;
                    card.innerHTML = `
                        <div class="card-name">${escapeHtml(opt.name)}</div>
                        <div class="card-price">${escapeHtml(opt.price)}</div>
                    `;
                    card.addEventListener('click', () => {
                        grid.querySelectorAll('.calc-option-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        updateCalculatorResultOld(opt);
                    });
                    grid.appendChild(card);
                });
                group.appendChild(grid);
            } else {
                const toggle = document.createElement('div');
                toggle.className = 'param-toggle';
                catOptions.forEach((opt, idx) => {
                    const btn = document.createElement('button');
                    btn.className = `toggle-option${idx === 0 ? ' active' : ''}`;
                    btn.textContent = opt.name;
                    btn.dataset.index = paramIndex + idx;
                    btn.addEventListener('click', () => {
                        toggle.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        updateCalculatorResultOld(opt);
                    });
                    toggle.appendChild(btn);
                });
                group.appendChild(toggle);
            }

            container.appendChild(group);
            paramIndex += catOptions.length;
        });
    }

    let selectedOption = null;

    function updateCalculatorResultOld(opt) {
        selectedOption = opt;
        const displayEl = document.getElementById('calcDisplay');
        if (displayEl) displayEl.textContent = `Выбрано: ${opt.name}`;
        const resultEl = document.getElementById('calcResult');
        if (resultEl) resultEl.style.display = 'block';
        const priceEl = document.getElementById('calcPrice');
        if (priceEl) priceEl.textContent = opt.price;
        const descEl = document.getElementById('calcDesc');
        if (descEl) descEl.textContent = opt.description || 'Срок: от 3 недель';
        const noteEl = document.getElementById('calcNote');
        if (noteEl) noteEl.textContent = opt.note || '* Точная стоимость обсуждается индивидуально';
        const confirmEl = document.getElementById('calcConfirm');
        if (confirmEl) confirmEl.style.display = 'block';

        const breakdown = document.getElementById('calcBreakdown');
        if (breakdown) {
            breakdown.innerHTML = `
                <div class="breakdown-item"><span>${opt.name}</span><span>${opt.price}</span></div>
                <div class="breakdown-item" style="font-weight:bold;border-top:2px solid var(--black);"><span>Итого</span><span>${opt.price}</span></div>
            `;
        }
    }

    // ==================== КАЛЬКУЛЯТОР (НОВАЯ ВЕРСИЯ С PACKAGES) ====================
    let selectedPackage = null;
    let selectedUnits = 1;
    let selectedAddons = new Set();

    function renderCalculatorNew(calcData) {
        const container = document.getElementById('calcParams');
        if (!container || !calcData.packages) return;
        container.innerHTML = '';

        // 1. Селектор Пакетов
        const pkgGroup = document.createElement('div');
        pkgGroup.className = 'param-group';
        pkgGroup.innerHTML = `<div class="param-label">1. ТИП ПРОЕКТА</div>`;

        const pkgGrid = document.createElement('div');
        pkgGrid.className = 'calc-option-grid';

        calcData.packages.forEach((pkg, idx) => {
            const card = document.createElement('div');
            card.className = `calc-option-card ${idx === 0 ? 'selected' : ''}`;
            card.innerHTML = `
                <div class="card-name">${escapeHtml(pkg.name)}</div>
                <div class="card-price">${pkg.isCustom ? 'Обсуждается в ЛС' : `от ${pkg.unitPrice * pkg.minUnits} ₽`}</div>
            `;
            card.addEventListener('click', () => {
                pkgGrid.querySelectorAll('.calc-option-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectPackage(pkg);
            });
            pkgGrid.appendChild(card);
        });
        pkgGroup.appendChild(pkgGrid);
        container.appendChild(pkgGroup);

        // 2. Блок выбора количества
        const qtyGroup = document.createElement('div');
        qtyGroup.className = 'param-group';
        qtyGroup.id = 'calcQtyGroup';
        qtyGroup.innerHTML = `
            <div class="param-label" id="qtyLabel">2. КОЛИЧЕСТВО ЕДИНИЦ</div>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                <input type="range" id="qtySlider" min="1" max="50" value="10" style="flex: 1;">
                <span id="qtyVal" style="font-family: monospace; font-weight: bold; font-size: 1.2rem; color: var(--accent-purple); min-width: 60px; text-align: right;">10</span>
            </div>
            <div class="param-description" id="qtyNote" style="margin-top: 0.5rem;"></div>
        `;
        container.appendChild(qtyGroup);

        const qtySlider = qtyGroup.querySelector('#qtySlider');
        const qtyVal = qtyGroup.querySelector('#qtyVal');
        qtySlider.addEventListener('input', (e) => {
            selectedUnits = parseInt(e.target.value, 10);
            qtyVal.textContent = selectedUnits;
            updateReceipt();
        });

        // 3. Блок доп. опций
        if (calcData.addons && calcData.addons.length > 0) {
            const addonsGroup = document.createElement('div');
            addonsGroup.className = 'param-group';
            addonsGroup.innerHTML = `<div class="param-label">3. ДОПОЛНИТЕЛЬНО</div>`;

            calcData.addons.forEach(addon => {
                const label = document.createElement('label');
                label.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; cursor: pointer; font-family: monospace; font-size: 0.85rem;';
                label.innerHTML = `
                    <input type="checkbox" value="${addon.id}" style="accent-color: var(--accent-lime); width: 18px; height: 18px;">
                    <span>${escapeHtml(addon.name)} (<strong>+${addon.price.toLocaleString('ru-RU')} ₽</strong>)</span>
                `;
                const chk = label.querySelector('input');
                chk.addEventListener('change', () => {
                    if (chk.checked) selectedAddons.add(addon);
                    else selectedAddons.delete(addon);
                    updateReceipt();
                });
                addonsGroup.appendChild(label);
            });
            container.appendChild(addonsGroup);
        }

        // По умолчанию выбираем первый пакет
        selectPackage(calcData.packages[0]);
    }

    function selectPackage(pkg) {
        selectedPackage = pkg;
        selectedUnits = pkg.minUnits || 1;

        const qtyGroup = document.getElementById('calcQtyGroup');
        const qtySlider = document.getElementById('qtySlider');
        const qtyVal = document.getElementById('qtyVal');
        const qtyLabel = document.getElementById('qtyLabel');
        const qtyNote = document.getElementById('qtyNote');

        if (pkg.isCustom) {
            if (qtyGroup) qtyGroup.style.display = 'none';
        } else {
            if (qtyGroup) qtyGroup.style.display = 'block';
            if (qtyLabel) qtyLabel.textContent = `2. КОЛИЧЕСТВО (${pkg.unitName ? pkg.unitName.toUpperCase() : 'ЕДИНИЦ'})`;
            if (qtySlider) {
                qtySlider.min = pkg.minUnits || 1;
                qtySlider.value = pkg.minUnits || 1;
            }
            if (qtyVal) qtyVal.textContent = pkg.minUnits || 1;
            if (qtyNote) qtyNote.textContent = pkg.note || '';
        }

        // Флеш-уведомление
        if (pkg.flashNotice) {
            brutalNotify(pkg.flashNotice);
        }

        updateReceipt();
    }

    function updateReceipt() {
        if (!selectedPackage) return;

        const resultBox = document.getElementById('calcResult');
        const priceEl = document.getElementById('calcPrice');
        const descEl = document.getElementById('calcDesc');
        const breakdown = document.getElementById('calcBreakdown');
        const confirmBtn = document.getElementById('calcConfirm');
        const noteEl = document.getElementById('calcNote');

        if (!resultBox || !priceEl || !descEl || !breakdown || !confirmBtn || !noteEl) return;

        resultBox.style.display = 'block';
        confirmBtn.style.display = 'block';

        if (selectedPackage.isCustom) {
            priceEl.textContent = "Обсуждается в ЛС";
            descEl.textContent = "Срок: по запросу";
            noteEl.textContent = "* Индивидуальный проект";
            breakdown.innerHTML = `
                <div class="breakdown-item"><span>Состав:</span><span>Индивидуальный ТЗ/Код</span></div>
            `;
            return;
        }

        // Расчет итогов
        let baseTotal = selectedPackage.unitPrice * selectedUnits;
        let addonsTotal = 0;
        let breakdownHTML = `<div class="breakdown-item"><span>${selectedPackage.name} (${selectedUnits} × ${selectedPackage.unitPrice.toLocaleString('ru-RU')} ₽)</span><span>${baseTotal.toLocaleString('ru-RU')} ₽</span></div>`;

        selectedAddons.forEach(addon => {
            addonsTotal += addon.price;
            breakdownHTML += `<div class="breakdown-item"><span>+ ${addon.name}</span><span>${addon.price.toLocaleString('ru-RU')} ₽</span></div>`;
        });

        const grandTotal = baseTotal + addonsTotal;
        const totalDays = Math.max(2, Math.ceil(selectedUnits * (selectedPackage.daysPerUnit || 1)));

        breakdownHTML += `<div class="breakdown-item" style="font-weight:bold;border-top:2px solid var(--black);margin-top:0.5rem;padding-top:0.3rem;"><span>ИТОГО ЧЕК</span><span>${grandTotal.toLocaleString('ru-RU')} ₽</span></div>`;

        priceEl.textContent = `~ ${grandTotal.toLocaleString('ru-RU')} ₽`;
        descEl.textContent = `Примерный срок реализации: ~${totalDays} рабочих дн.`;
        noteEl.textContent = '* Точная стоимость обсуждается индивидуально';
        breakdown.innerHTML = breakdownHTML;
    }

    // ==================== ГЛИТЧ-КОНТРОЛЬ ====================
    function renderGlitchControls(controls) {
        const body = document.getElementById('glitchPanelBody');
        if (!body) return;
        body.innerHTML = '';

        controls.forEach(control => {
            const item = document.createElement('div');
            item.className = 'glitch-control-item';
            item.dataset.controlId = control.id;

            const label = document.createElement('span');
            label.className = 'control-label';
            label.innerHTML = `<span class="control-icon">${control.icon || ''}</span> ${control.label}`;
            item.appendChild(label);

            if (control.type === 'toggle') {
                const toggle = document.createElement('div');
                toggle.className = `mini-toggle${control.default !== false ? ' active' : ''}`;
                toggle.innerHTML = '<span class="mini-thumb"></span>';
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('active');
                    applyGlitch(control.id, toggle.classList.contains('active'));
                    saveGlitch(control.id, toggle.classList.contains('active'));
                });
                item.appendChild(toggle);
            } else if (control.type === 'range') {
                const container = document.createElement('div');
                container.className = 'control-slider';
                const input = document.createElement('input');
                input.type = 'range';
                input.min = control.min || 0;
                input.max = control.max || 100;
                input.value = control.default || 50;
                const val = document.createElement('span');
                val.className = 'slider-value';
                val.textContent = `${input.value}%`;
                input.addEventListener('input', () => {
                    val.textContent = `${input.value}%`;
                    applyGlitch(control.id, parseInt(input.value));
                    saveGlitch(control.id, parseInt(input.value));
                });
                container.appendChild(input);
                container.appendChild(val);
                item.appendChild(container);
            }

            body.appendChild(item);
        });

        loadGlitchSettings();
    }

    function applyGlitch(id, value) {
        const intensity = (value || 50) / 50;

        switch(id) {
            case 'spiralGlitch':
                const spiral = document.getElementById('spiralImg');
                if (spiral) {
                    spiral.style.opacity = value ? '0.35' : '0.05';
                    spiral.style.animation = value ? '' : 'none';
                }
                break;
            case 'textGlitch':
                document.querySelectorAll('.glitch-text').forEach(el => {
                    if (value) {
                        el.dataset.text = el.textContent;
                        el.classList.add('glitch-text');
                    } else {
                        el.classList.remove('glitch-text');
                    }
                });
                break;
            case 'imageGlitch':
                document.querySelectorAll('.work-preview').forEach(el => {
                    el.classList.toggle('glitch-image', value);
                });
                break;
            case 'hoverGlitch':
                document.querySelectorAll('.feature-card, .work-item, .brutal-btn').forEach(el => {
                    el.classList.toggle('glitch-hover', value);
                });
                break;
            case 'intensity':
                document.documentElement.style.setProperty('--glitch-intensity', intensity);
                document.querySelectorAll('.glitch-text::before, .glitch-text::after').forEach(el => {
                    el.style.animationDuration = `${0.3 / intensity}s`;
                });
                break;
            case 'spiralSpeed':
                const spiralEl = document.getElementById('spiralImg');
                if (spiralEl) {
                    spiralEl.style.animationDuration = `${20 / (value || 50) * 50}s`;
                }
                break;
            case 'geoPrimitives':
                document.querySelectorAll('.geo-primitive').forEach(el => {
                    el.style.display = value ? '' : 'none';
                });
                break;
            case 'dotPattern':
                const pattern = document.querySelector('.dot-pattern');
                if (pattern) pattern.style.opacity = value ? '0.06' : '0';
                break;
        }
    }

    function saveGlitch(id, value) {
        const settings = JSON.parse(localStorage.getItem('artfoma_glitch_settings') || '{}');
        settings[id] = value;
        localStorage.setItem('artfoma_glitch_settings', JSON.stringify(settings));
    }

    function loadGlitchSettings() {
        const settings = JSON.parse(localStorage.getItem('artfoma_glitch_settings') || '{}');
        Object.keys(settings).forEach(id => {
            applyGlitch(id, settings[id]);
            const item = document.querySelector(`.glitch-control-item[data-control-id="${id}"]`);
            if (item) {
                const toggle = item.querySelector('.mini-toggle');
                if (toggle) toggle.classList.toggle('active', settings[id]);
                const slider = item.querySelector('input[type="range"]');
                if (slider) {
                    slider.value = settings[id];
                    const val = item.querySelector('.slider-value');
                    if (val) val.textContent = `${settings[id]}%`;
                }
            }
        });
    }

    // ==================== ЛОАДЕР ====================
    function initLoader() {
        const loader = document.getElementById('loaderScene');
        const mainContent = document.getElementById('mainContent');
        const progressBar = document.getElementById('progressBar');
        const loaderText = document.getElementById('loaderText');
        const foma = document.getElementById('fomaTitle');

        let progress = 0;
        const steps = window.loaderSteps || ['инициализация', 'калибровка', 'активация', 'готово'];
        let stepIdx = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 10 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                if (progressBar) progressBar.style.width = '100%';
                if (loaderText) loaderText.textContent = steps[steps.length - 1] || 'готово';

                if (foma && !animationTriggered) {
                    animationTriggered = true;
                    setTimeout(() => foma.classList.add('filled'), 300);
                }

                setTimeout(() => {
                    if (loader) {
                        loader.classList.add('fade-out');
                        setTimeout(() => loader.style.display = 'none', 600);
                    }
                    if (mainContent) mainContent.classList.add('visible');
                    initSpiralParallax();
                }, 400);
            }
            if (progressBar) progressBar.style.width = `${progress}%`;

            const idx = Math.floor((progress / 100) * steps.length);
            if (idx > stepIdx && idx < steps.length) {
                stepIdx = idx;
                if (loaderText) loaderText.textContent = steps[idx];
            }
        }, 100);
    }

    // ==================== ПАРАЛЛАКС СПИРАЛИ ====================
    function initSpiralParallax() {
        const spiral = document.getElementById('spiralImg');
        if (!spiral) return;
        let target = 0, current = 0;

        function update() {
            current += (target - current) * 0.07;
            spiral.style.transform = `translateY(-50%) translateX(${current}%)`;
            requestAnimationFrame(update);
        }
        update();

        window.addEventListener('scroll', () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            target = maxScroll > 0 ? -(Math.min(1, window.scrollY / maxScroll) * 10) : 0;
        });
    }

    // ==================== УВЕДОМЛЕНИЯ ====================
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

    // ==================== НОВАЯ КОНТАКТНАЯ ФОРМА ====================
    function initContactForm() {
        const btn = document.getElementById('sendContactBtn');
        const nameInput = document.getElementById('contactName');
        const tagInput = document.getElementById('contactTag');
        const msgInput = document.getElementById('contactMessage');
        const status = document.getElementById('contactStatus');

        if (!btn || !nameInput || !tagInput || !msgInput || !status) return;

        btn.addEventListener('click', () => {
            const name = nameInput.value.trim();
            const tag = tagInput.value.trim();
            const message = msgInput.value.trim();

            if (!name || !tag || !message) {
                status.textContent = '⚠️ Заполните все поля';
                status.style.color = '#DD76FF';
                return;
            }

            const tgUsername = 'Waldemar_r';
            const text = `Новая заявка с сайта artfoma:

Имя: ${name}
Контакты: ${tag}
Сообщение: ${message}`;

            const url = `https://t.me/${tgUsername}?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');

            status.textContent = '✅ Сообщение отправлено в Telegram';
            status.style.color = '#B7F31E';

            nameInput.value = '';
            tagInput.value = '';
            msgInput.value = '';

            brutalNotify('ЗАЯВКА ОТПРАВЛЕНА');
        });
    }

    // ==================== КНОПКИ ====================
    function initButtons() {
        const exploreBtn = document.getElementById('exploreBtn');
        const projectsBtn = document.getElementById('projectsBtn');
        const moreBtn = document.getElementById('moreBtn');
        const modal = document.getElementById('modalOverlay');
        const close = document.getElementById('modalClose');
        const confirm = document.getElementById('calcConfirm');

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                if (!modal) return;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                const resultEl = document.getElementById('calcResult');
                if (resultEl) resultEl.style.display = 'none';
                const confirmEl = document.getElementById('calcConfirm');
                if (confirmEl) confirmEl.style.display = 'block';
                const displayEl = document.getElementById('calcDisplay');
                if (displayEl) displayEl.textContent = 'Выберите параметры проекта';
                selectedOption = null;
                if (selectedPackage) {
                    selectedPackage = null;
                    selectedAddons.clear();
                }
            });
        }

        if (close) {
            close.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
        }

        if (confirm) {
            confirm.addEventListener('click', () => {
                let projectName = '';
                let projectPrice = '';
                let projectDesc = '';

                if (selectedOption) {
                    projectName = selectedOption.name;
                    projectPrice = selectedOption.price;
                    projectDesc = selectedOption.description || 'Срок: от 3 недель';
                } else if (selectedPackage) {
                    projectName = selectedPackage.name;
                    if (selectedPackage.isCustom) {
                        projectPrice = 'Обсуждается в ЛС';
                    } else {
                        let baseTotal = selectedPackage.unitPrice * selectedUnits;
                        let addonsTotal = 0;
                        selectedAddons.forEach(addon => {
                            addonsTotal += addon.price;
                        });
                        projectPrice = (baseTotal + addonsTotal).toLocaleString('ru-RU') + ' ₽';
                    }
                    projectDesc = `Количество: ${selectedUnits} ${selectedPackage.unitName || 'ед.'}`;
                    if (selectedAddons.size > 0) {
                        const addonNames = Array.from(selectedAddons).map(a => a.name).join(', ');
                        projectDesc += `, Допы: ${addonNames}`;
                    }
                } else {
                    brutalNotify('ВЫБЕРИТЕ ПАРАМЕТРЫ');
                    return;
                }

                const message = `Запрос с калькулятора:

Проект: ${projectName}
Чек: ${projectPrice}
Детали: ${projectDesc}

Сколько будет стоить?`;

                const tgUsername = 'Waldemar_r';
                const url = `https://t.me/${tgUsername}?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');

                if (modal) modal.style.display = 'none';
                document.body.style.overflow = '';
                brutalNotify('ЗАПРОС ОТПРАВЛЕН В TELEGRAM');
            });
        }

        if (projectsBtn) {
            projectsBtn.addEventListener('click', () => {
                brutalNotify('КЕЙСЫ ЗАГРУЖЕНЫ');
                const section = document.getElementById('workSection');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (moreBtn) {
            moreBtn.addEventListener('click', () => {
                if (maxProjectsReached) {
                    brutalNotify('МАКСИМУМ ПРОЕКТОВ');
                    return;
                }
                const idx = window.allWorks.length - (window.initialWorksCount || 0);
                if (idx < (window.allAdditionalProjects || []).length) {
                    const proj = window.allAdditionalProjects[idx];
                    if (proj) {
                        addProject(proj);
                        brutalNotify(`+1 ПРОЕКТ // ${proj.title}`);
                    }
                } else {
                    brutalNotify('БОЛЬШЕ НЕТ ПРОЕКТОВ');
                    maxProjectsReached = true;
                }
            });
        }
    }

    // ==================== ПАНЕЛЬ ГЛИТЧА (СБОКУ) ====================
    function initGlitchPanel() {
        const panel = document.getElementById('glitchPanel');
        const closeBtn = document.getElementById('glitchPanelClose');
        const overlay = document.getElementById('glitchOverlay');
        const settingsIcon = document.getElementById('settingsIcon');

        function openPanel() {
            if (panel) panel.classList.add('open');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closePanel() {
            if (panel) panel.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (settingsIcon) {
            settingsIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                openPanel();
            });
        }

        if (closeBtn) closeBtn.addEventListener('click', closePanel);
        if (overlay) overlay.addEventListener('click', closePanel);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel && panel.classList.contains('open')) {
                closePanel();
            }
        });
    }

    // ==================== БЫСТРЫЙ ПЕРЕКЛЮЧАТЕЛЬ ====================
    function initAccessibilityToggle() {
        const toggle = document.getElementById('accessibilityToggle');
        if (!toggle) return;
        const track = toggle.querySelector('.toggle-track');

        const saved = localStorage.getItem('artfoma_glitch_reduced');
        if (saved === 'true') {
            document.body.classList.add('glitch-reduced');
            if (track) track.classList.add('active');
        }

        if (track) {
            track.addEventListener('click', (e) => {
                e.stopPropagation();
                const reduced = document.body.classList.toggle('glitch-reduced');
                track.classList.toggle('active', reduced);
                localStorage.setItem('artfoma_glitch_reduced', reduced);
                brutalNotify(reduced ? 'ГЛИТЧИ УМЕНЬШЕНЫ' : 'ГЛИТЧИ АКТИВИРОВАНЫ');
            });
        }
    }

    // ==================== КУРСОР ====================
    function initCustomCursor() {
        if (window.innerWidth <= 768) return;
        const cursor = document.getElementById('customCursor');
        if (!cursor) return;
        let mx = 0, my = 0, cx = 0, cy = 0;
        document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
        function update() {
            cx += (mx - cx) * 0.25;
            cy += (my - cy) * 0.25;
            cursor.style.left = cx + 'px';
            cursor.style.top = cy + 'px';
            requestAnimationFrame(update);
        }
        update();
    }

    // ==================== ИНИЦИАЛИЗАЦИЯ ====================
    async function init() {
        await loadContent();
        initLoader();
        initButtons();
        initContactForm();
        initGlitchPanel();
        initAccessibilityToggle();
        initCustomCursor();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeUp 0.5s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.feature-card, .work-item').forEach(el => {
            el.style.opacity = '0';
            observer.observe(el);
        });
    }

    init();
})();
