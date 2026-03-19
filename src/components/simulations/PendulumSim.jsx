import { useEffect, useRef, useState } from 'react';

const PendulumSim = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [length, setLength] = useState(5);
    const [gravity, setGravity] = useState(9.8);
    const [angle, setAngle] = useState(45);

    const [stats, setStats] = useState({ t: 0, currentAngle: 0, omega: 0, period: 0 });
    const [isRunning, setIsRunning] = useState(false);

    const simState = useRef({
        time: 0,
        animationId: null,
        L: 5,
        g: 9.8,
        theta0: 0,
        theta: 0,
        omega: 0, // angular velocity
        scale: 40, // pixels per meter
        dt: 0.05
    });

    const drawFrame = (ctx, canvas, theta) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { L, scale } = simState.current;
        const cx = canvas.width / 2;
        const cy = 60; // top anchor

        const scaledL = L * scale;

        // Draw horizontal support
        ctx.beginPath();
        ctx.moveTo(cx - 50, cy);
        ctx.lineTo(cx + 50, cy);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 4;
        ctx.stroke();

        const bx = cx + scaledL * Math.sin(theta);
        const by = cy + scaledL * Math.cos(theta);

        // Draw string
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw bob
        ctx.beginPath();
        ctx.arc(bx, by, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const { L, g, dt } = simState.current;
        simState.current.L = parseFloat(length);
        simState.current.g = parseFloat(gravity);
        let { theta } = simState.current;

        // Simple Euler integration for pendulum
        // a = - (g / L) * sin(theta)
        const alpha = -(g / L) * Math.sin(theta);
        simState.current.omega += alpha * dt;
        simState.current.theta += simState.current.omega * dt;
        simState.current.time += dt;

        const period = 2 * Math.PI * Math.sqrt(L / g);

        setStats({
            t: simState.current.time,
            currentAngle: (simState.current.theta * 180 / Math.PI),
            omega: simState.current.omega,
            period
        });

        drawFrame(ctx, canvas, simState.current.theta);
        simState.current.animationId = requestAnimationFrame(animate);
    };

    const toggleSim = () => {
        if (isRunning) {
            setIsRunning(false);
            cancelAnimationFrame(simState.current.animationId);
        } else {
            // When resuming, we don't reset initial conditions unless it's a fresh start
            if (simState.current.time === 0) {
                simState.current.L = parseFloat(length);
                simState.current.g = parseFloat(gravity);
                simState.current.theta = parseFloat(angle) * (Math.PI / 180);
                simState.current.theta0 = simState.current.theta;
                simState.current.omega = 0;
            }
            setIsRunning(true);
            animate();
        }
    };

    const resetSim = () => {
        setIsRunning(false);
        cancelAnimationFrame(simState.current.animationId);
        setStats({ t: 0, currentAngle: parseFloat(angle), omega: 0, period: 2 * Math.PI * Math.sqrt(parseFloat(length) / parseFloat(gravity)) });
        const canvas = canvasRef.current;
        if (canvas) {
            simState.current.L = parseFloat(length);
            simState.current.time = 0;
            simState.current.theta = parseFloat(angle) * (Math.PI / 180);
            simState.current.omega = 0;
            drawFrame(canvas.getContext('2d'), canvas, simState.current.theta);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
                if (!isRunning) {
                    simState.current.theta = parseFloat(angle) * (Math.PI / 180);
                    drawFrame(canvas.getContext('2d'), canvas, simState.current.theta);
                }
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        const currentSimState = simState.current;
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(currentSimState.animationId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isRunning) {
            resetSim();
        }
        // eslint-disable-next-line
    }, [length, gravity, angle]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Длина (м): {length}</label>
                        <input type="range" min="1" max="10" step="0.5" value={length} onChange={e => setLength(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Гравитация (м/с²): {gravity}</label>
                        <input type="range" min="1" max="25" step="0.1" value={gravity} onChange={e => setGravity(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '150px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Нач. Угол (°): {angle}</label>
                        <input type="range" min="-90" max="90" value={angle} onChange={e => setAngle(e.target.value)} style={{ width: '100%', accentColor: 'var(--primary)' }} />
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
                        <span style={{ color: 'var(--text-muted)' }}>Текущий угол:</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.currentAngle.toFixed(1)}°</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Угл. скорость (ω):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.omega.toFixed(2)} рад/с</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Период (T):</span>
                        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{stats.period.toFixed(2)} с</span>
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

export default PendulumSim;
