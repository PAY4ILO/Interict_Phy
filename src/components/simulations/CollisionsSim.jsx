import { useEffect, useRef, useState } from 'react';

const CollisionsSim = ({ hideResults = false }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Inputs
    const [m1, setM1] = useState(2);
    const [v1, setV1] = useState(5);
    const [m2, setM2] = useState(2);
    const [v2, setV2] = useState(-3);

    const [stats, setStats] = useState({ t: 0, pTotal: 0, eTotal: 0, currentV1: 0, currentV2: 0, collided: false });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        m1: 2, m2: 2,
        v1: 5, v2: -3,
        x1: 20, x2: 380, // initial positions
        r1: 15, r2: 15, // radii proportional to mass roughly
        collided: false,
        dt: 0.05,
        scale: 5
    });

    const drawFrame = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { x1, x2, r1, r2, scale } = simState.current;
        const cy = canvas.height / 2;

        // Draw ground line
        ctx.beginPath();
        ctx.moveTo(0, cy + Math.max(r1, r2));
        ctx.lineTo(canvas.width, cy + Math.max(r1, r2));
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Block 1
        ctx.beginPath();
        ctx.arc(x1 * scale, cy, r1, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('1', x1 * scale, cy);

        // Draw Block 2
        ctx.beginPath();
        ctx.arc(x2 * scale, cy, r2, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#b91c1c';
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.fillText('2', x2 * scale, cy);
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let { x1, x2, v1, v2, m1, m2, r1, r2, scale, dt, time, collided } = simState.current;

        // Check bounds (bounce off walls)
        const screenW_in_m = canvas.width / scale;
        if (x1 - r1 / scale < 0) { x1 = r1 / scale; v1 = Math.abs(v1); }
        if (x2 + r2 / scale > screenW_in_m) { x2 = screenW_in_m - r2 / scale; v2 = -Math.abs(v2); }
        if (x1 + r1 / scale > screenW_in_m) { x1 = screenW_in_m - r1 / scale; v1 = -Math.abs(v1); }
        if (x2 - r2 / scale < 0) { x2 = r2 / scale; v2 = Math.abs(v2); }

        // Check collision between 1 and 2
        if (!collided && Math.abs(x2 - x1) <= (r1 + r2) / scale) {
            // Elastic collision 1D formulas
            const new_v1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
            const new_v2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
            v1 = new_v1;
            v2 = new_v2;
            collided = true;

            // push them slightly apart to prevent sticking
            const overlap = (r1 + r2) / scale - Math.abs(x2 - x1);
            if (x1 < x2) { x1 -= overlap / 2; x2 += overlap / 2; } else { x1 += overlap / 2; x2 -= overlap / 2; }
        } else if (Math.abs(x2 - x1) > (r1 + r2) / scale) {
            // Reset collision flag once separated
            collided = false;
        }

        // Update positions
        x1 += v1 * dt;
        x2 += v2 * dt;
        time += dt;

        simState.current = { ...simState.current, x1, x2, v1, v2, time, collided };

        const pTotal = m1 * v1 + m2 * v2;
        const eTotal = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;

        setStats({ t: time, pTotal, eTotal, currentV1: v1, currentV2: v2, collided });

        drawFrame(canvas);
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            if (simState.current.time === 0) {
                const numM1 = parseFloat(m1);
                const numM2 = parseFloat(m2);
                simState.current.m1 = numM1;
                simState.current.m2 = numM2;
                simState.current.v1 = parseFloat(v1);
                simState.current.v2 = parseFloat(v2);
                // Radii proportional to sqrt of mass
                simState.current.r1 = 15 + Math.sqrt(numM1) * 3;
                simState.current.r2 = 15 + Math.sqrt(numM2) * 3;

                const canvas = canvasRef.current;
                simState.current.x1 = 10;
                simState.current.x2 = (canvas.width / simState.current.scale) - 10;
                simState.current.collided = false;
            }
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);

        simState.current.time = 0;
        const numM1 = parseFloat(m1);
        const numM2 = parseFloat(m2);
        simState.current.m1 = numM1;
        simState.current.m2 = numM2;
        simState.current.v1 = parseFloat(v1);
        simState.current.v2 = parseFloat(v2);
        simState.current.r1 = 15 + Math.sqrt(numM1) * 3;
        simState.current.r2 = 15 + Math.sqrt(numM2) * 3;

        const canvas = canvasRef.current;
        if (canvas) {
            simState.current.x1 = 10;
            simState.current.x2 = (canvas.width / simState.current.scale) - 10;
            simState.current.collided = false;

            setStats({
                t: 0,
                pTotal: numM1 * parseFloat(v1) + numM2 * parseFloat(v2),
                eTotal: 0.5 * numM1 * Math.pow(parseFloat(v1), 2) + 0.5 * numM2 * Math.pow(parseFloat(v2), 2),
                currentV1: parseFloat(v1),
                currentV2: parseFloat(v2),
                collided: false
            });
            drawFrame(canvas);
        }
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
    }, [m1, v1, m2, v2]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>Тело 1 (Синее)</h4>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Масса 1 (кг): {m1}</label>
                    <input type="range" min="1" max="20" value={m1} onChange={e => setM1(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>Скор. 1 (м/с): {v1}</label>
                    <input type="range" min="-15" max="15" value={v1} onChange={e => setV1(e.target.value)} style={{ width: '100%', accentColor: '#3b82f6' }} />
                </div>

                <div style={{ flex: 1, minWidth: '200px', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>Тело 2 (Красное)</h4>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Масса 2 (кг): {m2}</label>
                    <input type="range" min="1" max="20" value={m2} onChange={e => setM2(e.target.value)} style={{ width: '100%', accentColor: '#ef4444' }} />
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>Скор. 2 (м/с): {v2}</label>
                    <input type="range" min="-15" max="15" value={v2} onChange={e => setV2(e.target.value)} style={{ width: '100%', accentColor: '#ef4444' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Кинематика</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Скор. V1:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#3b82f6' }}>{stats.currentV1.toFixed(1)} м/с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Скор. V2:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace', color: '#ef4444' }}>{stats.currentV2.toFixed(1)} м/с</span>
                    </div>
                    <h3 style={{ margin: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginTop: '10px' }}>Сохранение</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Сумм. импульс (P):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.pTotal.toFixed(1)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Кин. Энергия (E):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{hideResults ? '❓' : `${stats.eTotal.toFixed(1)} Дж`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollisionsSim;
