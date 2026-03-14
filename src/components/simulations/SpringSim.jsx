import React, { useEffect, useRef, useState } from 'react';

const SpringSim = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [mass, setMass] = useState(2);
    const [springK, setSpringK] = useState(15);
    const [displacement, setDisplacement] = useState(5);

    const [stats, setStats] = useState({ t: 0, x: 0, v: 0, period: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        m: 2, k: 15, x0: 5,
        x: 5, v: 0,
        dt: 0.05,
        scale: 15 // px per unit
    });

    const drawFrame = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const { x, scale } = simState.current;

        const wallX = cx - 150;
        const blockX = cx + x * scale;

        // Draw Wall
        ctx.beginPath();
        ctx.rect(wallX - 20, cy - 60, 20, 120);
        ctx.fillStyle = '#64748b';
        ctx.fill();

        // Draw Ground
        ctx.beginPath();
        ctx.moveTo(wallX - 20, cy + 30);
        ctx.lineTo(canvas.width, cy + 30);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Spring (zigzag)
        ctx.beginPath();
        ctx.moveTo(wallX, cy);
        const coils = 12;
        const spacing = (blockX - wallX - 20) / coils;
        for (let i = 1; i <= coils; i++) {
            const sx = wallX + i * spacing - spacing / 2;
            const sy = cy + (i % 2 === 0 ? 15 : -15);
            ctx.lineTo(sx, sy);
        }
        ctx.lineTo(blockX - 20, cy);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Block
        ctx.beginPath();
        ctx.rect(blockX - 20, cy - 20, 40, 50);
        ctx.fillStyle = '#f43f5e';
        ctx.fill();
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Equilibrium line
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(cx, cy - 40);
        ctx.lineTo(cx, cy + 50);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let { x, v, m, k, dt, time } = simState.current;

        // Hooke's Law: a = -(k/m)*x
        const a = -(k / m) * x;

        v += a * dt;
        x += v * dt;
        time += dt;

        simState.current = { ...simState.current, x, v, time };

        const period = 2 * Math.PI * Math.sqrt(m / k);

        setStats({ t: time, x, v, period });

        drawFrame(canvas);
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            if (simState.current.time === 0) {
                simState.current.m = parseFloat(mass);
                simState.current.k = parseFloat(springK);
                simState.current.x = parseFloat(displacement);
                simState.current.x0 = parseFloat(displacement);
                simState.current.v = 0;
            }
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);

        const initialX = parseFloat(displacement);
        simState.current.time = 0;
        simState.current.x = initialX;
        simState.current.v = 0;

        setStats({
            t: 0,
            x: initialX,
            v: 0,
            period: 2 * Math.PI * Math.sqrt(parseFloat(mass) / parseFloat(springK))
        });

        const canvas = canvasRef.current;
        if (canvas) drawFrame(canvas);
    };

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
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (!isRunning) {
            resetSim();
        }
        // eslint-disable-next-line
    }, [mass, springK, displacement]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Масса (кг): {mass}</label>
                        <input type="range" min="0.5" max="10" step="0.5" value={mass} onChange={e => setMass(e.target.value)} disabled={isRunning} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Жесткость (k): {springK}</label>
                        <input type="range" min="1" max="50" value={springK} onChange={e => setSpringK(e.target.value)} disabled={isRunning} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Смещение X0 (м): {displacement}</label>
                        <input type="range" min="-10" max="10" value={displacement} onChange={e => setDisplacement(e.target.value)} disabled={isRunning} style={{ width: '100%', accentColor: 'var(--primary)' }} />
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
                        <span style={{ color: 'var(--text-muted)' }}>Омега (ω):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{Math.sqrt(springK / mass).toFixed(2)} рад/с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Период (T):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.period.toFixed(2)} с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Текущий X:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.x.toFixed(2)} м</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Скорость (v):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.v.toFixed(2)} м/с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Время (t):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.t.toFixed(2)} с</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpringSim;
