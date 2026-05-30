document.addEventListener('DOMContentLoaded', () => {
    const inputDisplay = document.getElementById('inputDisplay');
    const formulaDisplay = document.getElementById('formulaDisplay');
    const equalsBtn = document.getElementById('equalsBtn');
    const clearBtn = document.getElementById('clearBtn');
    const backspaceBtn = document.getElementById('backspaceBtn');
    const calculatorContainer = document.querySelector('.calculator-container');

    let currentInput = '0';
    let formula = '';
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    function updateDisplay() {
        inputDisplay.textContent = currentInput;
        formulaDisplay.textContent = formula;
    }

    function appendNumber(num) {
        if (currentInput === '0' && num !== '.') {
            currentInput = num === 'π' ? Math.PI.toString() : num;
        } else if (num === '.' && !currentInput.includes('.')) {
            currentInput += num;
        } else if (num === 'π') {
            currentInput += Math.PI.toString();
        } else if (num !== '.') {
            currentInput += num;
        }
        updateDisplay();
    }

    function appendOperator(op) {
        if (currentInput !== '0') {
            formula += currentInput + ' ' + op + ' ';
            currentInput = '0';
        }
        updateDisplay();
    }

    function appendParen(paren) {
        formula += paren;
        updateDisplay();
    }

    function applyFunction(func) {
        if (currentInput !== '0') {
            switch (func) {
                case 'sin':
                    currentInput = Math.sin(eval(currentInput) * Math.PI / 180).toString();
                    break;
                case 'cos':
                    currentInput = Math.cos(eval(currentInput) * Math.PI / 180).toString();
                    break;
                case 'tan':
                    currentInput = Math.tan(eval(currentInput) * Math.PI / 180).toString();
                    break;
                case 'sqrt':
                    currentInput = Math.sqrt(eval(currentInput)).toString();
                    break;
                case 'log':
                    currentInput = Math.log10(eval(currentInput)).toString();
                    break;
                case 'ln':
                    currentInput = Math.log(eval(currentInput)).toString();
                    break;
                case 'abs':
                    currentInput = Math.abs(eval(currentInput)).toString();
                    break;
                case 'factorial':
                    const n = parseInt(currentInput);
                    currentInput = (n <= 1 ? 1 : n * (n - 1)).toString();
                    break;
                case 'power':
                    formula += 'Math.pow(' + currentInput + ', ';
                    currentInput = '0';
                    break;
                case 'derivative':
                    formula += 'derivative(';
                    break;
                case 'sum':
                    formula += 'sum(';
                    break;
            }
        }
        updateDisplay();
    }

    function calculate(e) {
        try {
            const expression = formula + currentInput;
            const result = math.evaluate(expression);
            currentInput = result.toString();
            formula = '';
            createWaterRipple(window.innerWidth / 2, window.innerHeight / 2);
            renderKatex(expression, result);
        } catch (err) {
            currentInput = 'Error';
            formula = '';
        }
        updateDisplay();
    }

    function clearAll(e) {
        currentInput = '0';
        formula = '';
        updateDisplay();
    }

    function backspace(e) {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }

    function animateButton(btn) {
        if (btn) {
            btn.style.transform = 'scale(0.92)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 120);
        }
    }

    function createButtonRipple(btn) {
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: buttonRipple 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            left: ${rect.width / 2}px;
            top: ${rect.height / 2}px;
            width: ${rect.width * 2}px;
            height: ${rect.height * 2}px;
            margin-left: ${-rect.width}px;
            margin-top: ${-rect.height}px;
        `;
        btn.style.position = btn.style.position || 'relative';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }

    function createWaterRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: 50;
            transform: translate(-50%, -50%);
            animation: globalRipple 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1200);
    }

    function renderKatex(expression, result) {
        const kaTeXContainer = document.createElement('div');
        kaTeXContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            background: rgba(0, 0, 0, 0.7);
            padding: 20px 40px;
            border-radius: 20px;
            animation: kaZoom 1.5s ease-out;
            z-index: 1000;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;
        kaTeXContainer.id = 'ka-container';
        document.body.appendChild(kaTeXContainer);

        try {
            katex.render(`${expression} = ${result}`, kaTeXContainer, {
                throwOnError: false,
                displayMode: true
            });
        } catch (e) {
            kaTeXContainer.innerHTML = `<div style="color: white; font-size: 1.5rem;">${expression} = ${result}</div>`;
        }

        setTimeout(() => {
            if (kaTeXContainer && kaTeXContainer.parentNode) kaTeXContainer.remove();
        }, 2000);
    }

    function initWaterRippleCanvas() {
        const canvas = document.getElementById('waterCanvas');
        const ctx = canvas.getContext('2d');
        
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const ripples = [];
        
        document.addEventListener('click', (e) => {
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                radius: 0,
                maxRadius: 200,
                alpha: 0.3,
                speed: 3
            });
        });

        function drawRipple(ripple) {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            if (ripple.radius > 20) {
                ctx.beginPath();
                ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha * 0.5})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += r.speed;
                r.alpha *= 0.98;
                
                drawRipple(r);
                
                if (r.alpha < 0.01 || r.radius > r.maxRadius) {
                    ripples.splice(i, 1);
                }
            }
            
            requestAnimationFrame(animate);
        }
        animate();
    }

    document.querySelectorAll('[data-num]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            appendNumber(e.target.dataset.num);
        });
    });

    document.querySelectorAll('[data-op]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            appendOperator(e.target.dataset.op);
        });
    });

    document.querySelectorAll('[data-paren]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            appendParen(e.target.dataset.paren);
        });
    });

    document.querySelectorAll('[data-func]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            applyFunction(e.target.dataset.func);
            animateButton(e.target);
        });
    });

    equalsBtn.addEventListener('click', (e) => calculate(e));
    clearBtn.addEventListener('click', (e) => clearAll(e));
    backspaceBtn.addEventListener('click', (e) => backspace(e));

    document.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    function updateMouse() {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        const offsetX = (mouseX / window.innerWidth - 0.5) * 30;
        const offsetY = (mouseY / window.innerHeight - 0.5) * 30;
        
        if (calculatorContainer) {
            calculatorContainer.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
        
        requestAnimationFrame(updateMouse);
    }
    updateMouse();

    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            appendNumber(e.key);
            const numBtn = document.querySelector(`[data-num="${e.key}"]`);
            if (numBtn) animateButton(numBtn);
        } else if (e.key === '.' || e.key === ',') {
            appendNumber('.');
            const dotBtn = document.querySelector('[data-num="."]');
            if (dotBtn) animateButton(dotBtn);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            appendOperator(e.key);
            const opBtn = document.querySelector(`[data-op="${e.key}"]`);
            if (opBtn) animateButton(opBtn);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculate(e);
            animateButton(equalsBtn);
        } else if (e.key === 'Escape') {
            clearAll(e);
        } else if (e.key === 'Backspace') {
            backspace(e);
        }
    });

    initWaterRippleCanvas();

    const style = document.createElement('style');
    style.textContent = `
        @keyframes buttonRipple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        @keyframes globalRipple {
            0% { width: 0; height: 0; opacity: 0.6; border-width: 3px; }
            100% { width: 400px; height: 400px; opacity: 0; border-width: 1px; }
        }
        @keyframes kaZoom {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            10% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
            90% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    updateDisplay();
});