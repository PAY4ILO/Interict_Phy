import { useEffect, useRef, useState } from 'react';

const GasSim = ({ hideResults = false }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Inputs
    const [temperature, setTemperature] = useState(300); // K
    const [volume, setVolume] = useState(50); // %
    const [particleCount, setParticleCount] = useState(100);

    const [stats, setStats] = useState({ pressure: 0, pV: 0, nRT: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        animationId: null,
        particles: [],
        wallHits: 0,
        temp: 300,
        volPercent: 50,
        lastTime: performNow()
    });

    function performNow() { return (typeof performance !== 'undefined') ? performance.now() : Date.now(); }

    const initParticles = (count, temp, width, height) => {
        const particles = [];
        const speedBase = Math.sqrt(temp) * 0.5; // very simplified kinetic scaling

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            particles.push({
                x: Math.random() * (width - 10) + 5,
                y: Math.random() * (height - 10) + 5,
                vx: Math.cos(angle) * speedBase,
                vy: Math.sin(angle) * speedBase,
                r: 3
            });
        }
        return particles;
    };

    const drawFrame = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { particles, volPercent, temp } = simState.current;

        // Piston limit (volume controls width of the effective box)
        const boxWidth = canvas.width * (volPercent / 100);

        // Draw Box
        ctx.beginPath();
        ctx.rect(0, 0, boxWidth, canvas.height);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        if (document.body.classList.contains('light-mode')) ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.fill();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Draw piston (right wall)
        ctx.beginPath();
        ctx.moveTo(boxWidth, 0);
        ctx.lineTo(boxWidth, canvas.height);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Color based on temperature
        const minTemp = 100, maxTemp = 1000;
        const ratio = (temp - minTemp) / (maxTemp - minTemp);
        const r = Math.floor(ratio * 255);
        const b = Math.floor((1 - ratio) * 255);

        ctx.fillStyle = `rgb(${r}, 50, ${b})`;

        // Draw particles
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let { particles, volPercent, temp, lastTime } = simState.current;

        const now = performNow();
        const dt = Math.min((now - lastTime) / 16, 2); // normalize to ~60fps, cap at 2x if lag
        simState.current.lastTime = now;

        const boxWidth = canvas.width * (volPercent / 100);
        const boxHeight = canvas.height;
        let hitsThisFrame = 0;

        // Speed responds immediately to temp change (unphysical but good for sim)
        const speedBase = Math.sqrt(temp) * 0.5;

        particles.forEach(p => {
            // Adjust speed magnitude without changing direction if temp changed
            const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (currentSpeed > 0 && Math.abs(currentSpeed - speedBase) > 0.1) {
                p.vx = (p.vx / currentSpeed) * speedBase;
                p.vy = (p.vy / currentSpeed) * speedBase;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Bounce X
            if (p.x - p.r < 0) { p.x = p.r; p.vx *= -1; hitsThisFrame++; }
            else if (p.x + p.r > boxWidth) { p.x = boxWidth - p.r; p.vx *= -1; hitsThisFrame++; }

            // Bounce Y
            if (p.y - p.r < 0) { p.y = p.r; p.vy *= -1; hitsThisFrame++; }
            else if (p.y + p.r > boxHeight) { p.y = boxHeight - p.r; p.vy *= -1; hitsThisFrame++; }
        });

        simState.current.wallHits += hitsThisFrame;

        // Pressure calculation (rolling average of hits)
        // P = F/A roughly proportional to wallhits * temp / volume
        const fakePressure = (simState.current.wallHits * temp) / (boxWidth * boxHeight) * 10;

        // Slowly decay wall hits for rolling avg
        simState.current.wallHits *= 0.95;

        const V = volPercent; // relative volume
        const nR = particles.length;
        const T = temp;

        // P * V = n * R * T  =>  fakePressure * V roughly proportional to n * T

        setStats({
            pressure: fakePressure,
            pV: fakePressure * V,
            nRT: nR * T * 0.01 // scale factor
        });

        drawFrame(canvas);
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            const canvas = canvasRef.current;
            if (simState.current.particles.length === 0 && canvas) {
                simState.current.volPercent = parseFloat(volume);
                simState.current.temp = parseFloat(temperature);
                simState.current.particles = initParticles(
                    parseInt(particleCount),
                    parseFloat(temperature),
                    canvas.width * (parseFloat(volume) / 100),
                    canvas.height
                );
            }
            simState.current.lastTime = performNow();
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);

        simState.current.particles = [];
        simState.current.wallHits = 0;
        simState.current.volPercent = parseFloat(volume);
        simState.current.temp = parseFloat(temperature);

        setStats({ pressure: 0, pV: 0, nRT: 0 });

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            simState.current.particles = initParticles(
                parseInt(particleCount),
                parseFloat(temperature),
                canvas.width * (parseFloat(volume) / 100),
                canvas.height
            );
            drawFrame(canvas);
        }
    };

    // Live update temp/vol
    useEffect(() => {
        simState.current.temp = parseFloat(temperature);
        simState.current.volPercent = parseFloat(volume);

        // If volume shrinking, clamp particles
        const canvas = canvasRef.current;
        if (canvas && isRunning) {
            const boxW = canvas.width * (parseFloat(volume) / 100);
            simState.current.particles.forEach(p => {
                if (p.x + p.r > boxW) p.x = boxW - p.r;
            });
        }
    }, [temperature, volume, isRunning]);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                if (!isRunning) resetSim();
            }
        };
        window.addEventListener('resize', handleResize);
        setTimeout(handleResize, 100); // init delay
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Температура (К): {temperature}</label>
                        <input type="range" min="100" max="1000" value={temperature} onChange={e => setTemperature(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Объем (V %): {volume}</label>
                        <input type="range" min="20" max="100" value={volume} onChange={e => setVolume(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Частицы (n): {particleCount}</label>
                        <input type="range" min="10" max="500" value={particleCount} onChange={e => setParticleCount(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={toggleSim} style={{ minWidth: '120px' }}>
                        {isRunning ? 'ПАУЗА' : 'ЗАПУСК'}
                    </button>
                    <button className="btn-secondary" onClick={resetSim}>
                        СБРОС
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: '400px', flexWrap: 'wrap' }}>
                <div className="glass" ref={containerRef} style={{ flex: '3 1 400px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: '1 1 250px', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Давление (P):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#f59e0b' }}>{hideResults ? '❓' : `${stats.pressure.toFixed(1)} Pа`}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Объем (V):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : volume}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Темп. (T):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#ef4444' }}>{hideResults ? '❓' : `${temperature} K`}</span>
                    </div>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginTop: '10px' }}>Уравнение Менделеева-Клапейрона</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>P × V:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : stats.pV.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>n × R × T:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : stats.nRT.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GasSim;
