import { useEffect, useRef, useState } from 'react';

const GravitySim = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Inputs (scaled for simulation purposes)
    const [planetMass, setPlanetMass] = useState(100);
    const [satelliteV, setSatelliteV] = useState(3.5);
    const [initialR, setInitialR] = useState(120);

    const [stats, setStats] = useState({ t: 0, r: 0, v: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        G: 10, // Gravitational constant * M_planet scale factor
        x: 120, y: 0,
        vx: 0, vy: 3.5,
        dt: 0.1,
        trajectory: []
    });

    const drawFrame = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        const { x, y, trajectory } = simState.current;

        // Draw trajectory
        if (trajectory.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.lineWidth = 1;
            ctx.moveTo(cx + trajectory[0].x, cy + trajectory[0].y);
            for (let i = 1; i < trajectory.length; i += 2) {
                ctx.lineTo(cx + trajectory[i].x, cy + trajectory[i].y);
            }
            ctx.stroke();
        }

        // Draw Central Planet
        ctx.beginPath();
        const pRadius = 15 + Math.sqrt(parseFloat(planetMass));
        ctx.arc(cx, cy, pRadius, 0, Math.PI * 2);

        // Gradient for planet
        const grd = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, pRadius);
        grd.addColorStop(0, '#fcd34d');
        grd.addColorStop(1, '#d97706');
        ctx.fillStyle = grd;
        ctx.fill();

        // Draw Satellite
        ctx.beginPath();
        ctx.arc(cx + x, cy + y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        ctx.strokeStyle = '#2563eb';
        ctx.stroke();
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let { x, y, vx, vy, G, dt, time, trajectory } = simState.current;

        // r^2 = x^2 + y^2
        const rSq = x * x + y * y;
        const r = Math.sqrt(rSq);

        // F = G * M_planet / r^2
        // a = F (since m_satellite cancels out)
        const a = (G * parseFloat(planetMass)) / rSq;

        // Components of acceleration
        const ax = -a * (x / r);
        const ay = -a * (y / r);

        // Update velocity (Euler semi-implicit)
        vx += ax * dt;
        vy += ay * dt;

        // Update position
        x += vx * dt;
        y += vy * dt;
        time += dt;

        trajectory.push({ x, y });
        if (trajectory.length > 500) trajectory.shift(); // limit trail

        simState.current = { ...simState.current, x, y, vx, vy, time, trajectory };

        const currentV = Math.sqrt(vx * vx + vy * vy);

        setStats({ t: time, r, v: currentV });

        drawFrame(canvas);

        // Collision check
        const pRadius = 15 + Math.sqrt(parseFloat(planetMass));
        if (r < pRadius) {
            setIsRunning(false);
            return;
        }

        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            if (simState.current.time === 0) {
                simState.current.x = parseFloat(initialR);
                simState.current.y = 0;
                simState.current.vx = 0;
                simState.current.vy = parseFloat(satelliteV);
                simState.current.trajectory = [];
            }
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);

        const r = parseFloat(initialR);
        const v = parseFloat(satelliteV);
        simState.current = {
            ...simState.current,
            time: 0,
            x: r, y: 0,
            vx: 0, vy: v,
            trajectory: []
        };

        setStats({ t: 0, r, v });

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
    }, [planetMass, satelliteV, initialR]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Масса планеты (узн.): {planetMass}</label>
                        <input type="range" min="10" max="300" value={planetMass} onChange={e => setPlanetMass(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Нач. радиус (у.е.): {initialR}</label>
                        <input type="range" min="50" max="300" value={initialR} onChange={e => setInitialR(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Нач. скорость (у.е.): {satelliteV}</label>
                        <input type="range" min="0" max="10" step="0.1" value={satelliteV} onChange={e => setSatelliteV(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
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
                <div className="glass" ref={containerRef} style={{ flex: '3 1 400px', borderRadius: '12px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                    <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
                </div>

                <div className="glass" style={{ flex: '1 1 250px', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Телеметрия</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Радиус (r):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.r.toFixed(1)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Скорость (v):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.v.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Орбитальное время:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.t.toFixed(1)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>I Первая космическая: V ≈ {Math.sqrt(simState.current.G * planetMass / initialR).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GravitySim;
