// Дані блоків
        const BLOCKS = [
            { id: "D300-610x300x200", label: "PORISTON D300 300 (610×300×200)", d: 300, l: 610, t: 300, h: 200, weight: 16.7953, blocksPerPallet: 60 },
            { id: "D300-610x375x200", label: "PORISTON D300 375 (610×375×200)", d: 300, l: 610, t: 375, h: 200, weight: 20.9987, blocksPerPallet: 50 },
            { id: "D300-610x400x200", label: "PORISTON D300 400 (610×400×200)", d: 300, l: 610, t: 400, h: 200, weight: 22.3937, blocksPerPallet: 40 },
            { id: "D300-610x500x200", label: "PORISTON D300 500 (610×500×200)", d: 300, l: 610, t: 500, h: 200, weight: 27.9922, blocksPerPallet: 40 },
            { id: "D400-610x100x200", label: "PORISTON D400 100 (610×100×200)", d: 400, l: 610, t: 100, h: 200, weight: 6.7032, blocksPerPallet: 180 },
            { id: "D400-610x125x200", label: "PORISTON D400 125 (610×125×200)", d: 400, l: 610, t: 125, h: 200, weight: 8.3808, blocksPerPallet: 140 },
            { id: "D400-610x250x200", label: "PORISTON D400 250 (610×250×200)", d: 400, l: 610, t: 250, h: 200, weight: 16.7580, blocksPerPallet: 70 },
            { id: "D400-610x280x200", label: "PORISTON D400 280 (610×280×200)", d: 400, l: 610, t: 280, h: 200, weight: 19.2763, blocksPerPallet: 60 },
            { id: "D400-610x300x200", label: "PORISTON D400 300 (610×300×200)", d: 400, l: 610, t: 300, h: 200, weight: 20.1097, blocksPerPallet: 60 },
            { id: "D400-610x375x200", label: "PORISTON D400 375 (610×375×200)", d: 400, l: 610, t: 375, h: 200, weight: 25.1425, blocksPerPallet: 50 },
            { id: "D400-610x500x200", label: "PORISTON D400 500 (610×500×200)", d: 400, l: 610, t: 500, h: 200, weight: 33.5131, blocksPerPallet: 40 },
            { id: "D500-610x100x200", label: "PORISTON D500 100 (610×100×200)", d: 500, l: 610, t: 100, h: 200, weight: 7.5979, blocksPerPallet: 180 },
            { id: "D500-610x150x200", label: "PORISTON D500 150 (610×150×200)", d: 500, l: 610, t: 150, h: 200, weight: 11.3968, blocksPerPallet: 120 },
            { id: "D500-610x250x200", label: "PORISTON D500 250 (610×250×200)", d: 500, l: 610, t: 250, h: 200, weight: 18.9947, blocksPerPallet: 70 },
            { id: "D500-610x300x200", label: "PORISTON D500 300 (610×300×200)", d: 500, l: 610, t: 300, h: 200, weight: 22.7936, blocksPerPallet: 60 }
        ];
        
        // Константи для розрахунку
        const PALLET_TARE = 23; // kg
        const PALLET_SIZE = { width: 1220, length: 1000 }; // mm
        const GLUE_BAGS_PER_M3 = 1.5;
        const BAG_WEIGHT = 20; // kg
        
        // Змінні стану
        let selectedDensity = 300;
        let selectedBlockId = '';
        
        // Елементи DOM
        let densityRadios;
        let blockSizeSelect;
        let lengthInput;
        let heightInput;
        let openingsInput;
        
        let warningAlert;
        let successAlert;
        let warningText;
        
        let totalVolumeEl;
        let blocksWithWasteEl;
        let blocksRoundedEl;
        let palletsEl;
        let weightEl;
        let glueBagsEl;
        let blockInfoEl;
        
        // Ініціалізація після завантаження DOM
        document.addEventListener('DOMContentLoaded', function() {
            initializeElements();
            initializeEventListeners();
            updateBlockOptions();
            calculate();
        });
        
        // Ініціалізація елементів DOM
        function initializeElements() {
            densityRadios = document.querySelectorAll('input[name="density"]');
            blockSizeSelect = document.getElementById('block-size');
            lengthInput = document.getElementById('length');
            heightInput = document.getElementById('height');
            openingsInput = document.getElementById('openings');
            
            warningAlert = document.getElementById('warning-alert');
            successAlert = document.getElementById('success-alert');
            warningText = document.getElementById('warning-text');
            
            totalVolumeEl = document.getElementById('total-volume');
            blocksWithWasteEl = document.getElementById('blocks-with-waste');
            blocksRoundedEl = document.getElementById('blocks-rounded');
            palletsEl = document.getElementById('pallets');
            weightEl = document.getElementById('weight');
            glueBagsEl = document.getElementById('glue-bags');
            blockInfoEl = document.getElementById('block-info');
        }
        
        // Ініціалізація обробників подій
        function initializeEventListeners() {
            // Обробники для радіо-кнопок типу блоку
            densityRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    selectedDensity = parseInt(this.value);
                    updateBlockOptions();
                    calculate();
                });
            });
        
            // Обробник для вибору розміру блоку
            blockSizeSelect.addEventListener('change', function() {
                selectedBlockId = this.value;
                calculate();
            });
        
            // Обробники для полів введення
            lengthInput.addEventListener('input', debounce(calculate, 300));
            heightInput.addEventListener('input', debounce(calculate, 300));
            openingsInput.addEventListener('input', debounce(calculate, 300));
        }
        
        // Функція затримки для оптимізації
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
        
        // Функції форматування
        function formatNumber(n, d = 2) {
            if (!Number.isFinite(n) || n === 0) return '—';
            return n.toLocaleString('uk-UA', { 
                maximumFractionDigits: d, 
                minimumFractionDigits: 0 
            });
        }
        
        function formatInt(n) {
            if (!Number.isFinite(n) || n === 0) return '—';
            return Math.round(n).toLocaleString('uk-UA');
        }
        
        // Оновлення списку блоків
        function updateBlockOptions() {
            const availableBlocks = BLOCKS.filter(block => block.d === selectedDensity);
            
            // Очищення поточних опцій
            blockSizeSelect.innerHTML = '<option value="">Оберіть розмір блоку...</option>';
            
            // Додавання нових опцій
            availableBlocks.forEach(block => {
                const option = document.createElement('option');
                option.value = block.id;
                let suffix = '';
                if (block.d === 300) {
                    suffix = '-300-2,2 F100';
                } else if (block.d === 400) {
                    suffix = '-400-2,7 F100';
                } else if (block.d === 500) {
                    suffix = '-500-2,7 F100';
                }
                option.textContent = `${block.l}×${block.t}×${block.h}${suffix}`;
                blockSizeSelect.appendChild(option);
            });
            
            // Автовибір першого блоку
            if (availableBlocks.length > 0) {
                selectedBlockId = availableBlocks[0].id;
                blockSizeSelect.value = selectedBlockId;
            } else {
                selectedBlockId = '';
            }
        }
        
        // Головна функція розрахунку
        function calculate() {
            const selectedBlock = BLOCKS.find(block => block.id === selectedBlockId);
            let warning = '';
            
            if (!selectedBlock) {
                warning = 'Не вибрано тип блоку.';
                showResults({ 
                    warning, 
                    totalVolume: 0, 
                    blocksWithWaste: 0, 
                    blocksRoundedToPallet: 0, 
                    pallets: 0, 
                    palletWeightKg: 0, 
                    totalWeightKg: 0, 
                    glueBags: 0, 
                    info: 'Оберіть блок для отримання детальної інформації.' 
                });
                return;
            }
            
            const length = parseFloat(lengthInput.value) || 0;
            const height = parseFloat(heightInput.value) || 0;
            const openings = parseFloat(openingsInput.value) || 0;
            
            if (length === 0 || height === 0) {
                warning = 'Вкажіть додатні значення довжини та висоти.';
            }
            
            // Розрахунок параметрів блоку в метрах
            const h_m = selectedBlock.h / 1000;
            const l_m = selectedBlock.l / 1000;
            const t_m = selectedBlock.t / 1000;
            const blockFaceArea = h_m * l_m;
            const blockVolume = h_m * l_m * t_m;
            const blockWeight = selectedBlock.weight;
        
            // Розрахунок площі стіни з урахуванням отворів
            const wallArea = Math.max(0, length * height - openings);
            
            // Розрахунок кількості блоків
            const blocksExact = blockFaceArea > 0 ? wallArea / blockFaceArea : 0;
            const blocksWithWaste = Math.ceil(blocksExact * 1.05);
            const totalVolume = blocksWithWaste * blockVolume;
            
            // Розрахунок піддонів
            const blocksPerPallet = selectedBlock.blocksPerPallet;
            const pallets = blocksPerPallet > 0 ? Math.ceil(blocksWithWaste / blocksPerPallet) : 0;
            const blocksRoundedToPallet = pallets * blocksPerPallet;
        
            // Розрахунок ваги
            const palletWeightKg = (blocksPerPallet * blockWeight) + PALLET_TARE;
            const totalWeightKg = palletWeightKg * pallets;
            
            // Розрахунок клею
            const glueBags = Math.ceil(GLUE_BAGS_PER_M3 * totalVolume);
            
            // Перевірка помилок
            if (openings > length * height && !warning) {
                warning = 'Площа отворів перевищує площу стін — перевірте дані.';
            } else if (blocksPerPallet === 0 && !warning) {
                warning = 'Неможливо розраховувати кількість блоків на піддоні. Перевірте дані блоку.';
            }
        
            // Інформація про блок
            const info = `Вага 1 блоку ~${formatNumber(blockWeight, 2)} кг; Розмір ${selectedBlock.t}×${selectedBlock.h}×${selectedBlock.l} мм; 1 блок = ${formatNumber(blockFaceArea, 3)} м² у площині стіни, ${formatNumber(blockVolume, 3)} м³ об'єму. На 1 піддоні ${selectedBlock.blocksPerPallet} шт. Піддон: ${PALLET_TARE} кг, ${PALLET_SIZE.width}×${PALLET_SIZE.length} мм. Клей: ${GLUE_BAGS_PER_M3} мішка по ${BAG_WEIGHT} кг на 1 м³ газобетону.`;
        
            showResults({
                warning,
                totalVolume,
                blocksWithWaste,
                blocksRoundedToPallet,
                pallets,
                palletWeightKg,
                totalWeightKg,
                glueBags,
                info
            });
        }
        
        // Відображення результатів
        function showResults(results) {
            // Показ/приховування попереджень
            if (results.warning) {
                warningAlert.style.display = 'block';
                successAlert.style.display = 'none';
                warningText.textContent = results.warning;
            } else {
                warningAlert.style.display = 'none';
                successAlert.style.display = 'block';
            }
            
            // Оновлення значень метрик
            totalVolumeEl.textContent = `${formatNumber(results.totalVolume, 3)} м³`;
            blocksWithWasteEl.textContent = `${formatInt(results.blocksWithWaste)} шт`;
            blocksRoundedEl.textContent = `${formatInt(results.blocksRoundedToPallet)} шт`;
            palletsEl.textContent = `${formatInt(results.pallets)} шт`;
            
            // Форматування ваги
            const palletWeight = formatInt(results.palletWeightKg);
            const totalWeight = formatInt(results.totalWeightKg);
            weightEl.textContent = `${palletWeight} / ${totalWeight} кг`;
            
            glueBagsEl.textContent = `${formatInt(results.glueBags)} шт`;
        }
        
        // Додаткові функції для покращення UX
        function validateNumericInput(input) {
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                input.value = '';
                return 0;
            }
            return value;
        }
        
        // Обробка помилок введення
        lengthInput?.addEventListener('blur', function() {
            this.value = validateNumericInput(this);
        });
        
        heightInput?.addEventListener('blur', function() {
            this.value = validateNumericInput(this);
        });
        
        openingsInput?.addEventListener('blur', function() {
            this.value = validateNumericInput(this);
        });
        // Автоматичне повідомлення батьківському iframe про висоту
function sendHeight() {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: "resize-iframe", height }, "*");
}

// Виклик при завантаженні та при зміні розмірів
window.addEventListener("load", sendHeight);
window.addEventListener("resize", sendHeight);

// Також виклик після змін DOM (коли з’являються результати)
const observer = new MutationObserver(sendHeight);
observer.observe(document.body, { childList: true, subtree: true });
